import { QueryTypes } from 'sequelize';
import { CashRegisterRepository } from './cash-register.repository';
import { CashRegister } from './cash-register.model';
import { CashRegisterSummary } from './cash-register-summary.model';
import { PaymentMethod } from '../catalog/models/payment-method.model';
import { sequelize } from '../../config/database';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ConflictError } from '../../common/errors/conflict.error';
import { roundTo2 } from '../../common/helpers/math';
import { buildPaginationMeta, type PaginationParams } from '../../common/helpers/pagination';
import type { OpenCashRegisterDto, CloseCashRegisterDto } from './cash-register.dto';

/** name of the payment method considered as physical cash */
const CASH_METHOD_NAME = 'cash';

interface SalesByMethodRow {
  payment_method_id: number;
  total_sales: string;
  transaction_count: string;
}

/**
 * CashRegisterService — business logic for cash sessions.
 *
 * Core rules:
 * - Only ONE register may be OPEN at a time.
 * - On close, sales made during the session are aggregated per payment
 *   method to build summary rows and compute the expected cash amount.
 * - expected_amount = opening_amount + cash sales.
 * - difference = actual_amount - expected_amount.
 */
export class CashRegisterService {
  constructor(private readonly repository = new CashRegisterRepository()) {}

  /**
   * Get the id of the currently open register, or null if none.
   * Used by SaleService to attach sales to the active session.
   */
  async getActiveId(): Promise<number | null> {
    const open = await this.repository.findOpen();
    return open ? open.id : null;
  }

  /** Return the open register with details, or null. */
  async getCurrent() {
    return this.repository.findOpenDetailed();
  }

  /** Status endpoint: does an open register exist? (used by frontend) */
  async getStatus() {
    const open = await this.repository.findOpen();
    return {
      isOpen: open !== null,
      cashRegisterId: open ? open.id : null,
    };
  }

  async getAll(params: PaginationParams) {
    const { rows, count } = await this.repository.findAll(params);
    return { data: rows, meta: buildPaginationMeta(count, params) };
  }

  async getById(id: number) {
    const register = await this.repository.findById(id);
    if (!register) throw new NotFoundError('Caja');
    return register;
  }

  /**
   * Open a new cash register.
   * Fails if one is already OPEN (only one session at a time).
   */
  async open(userId: string, data: OpenCashRegisterDto) {
    const existing = await this.repository.findOpen();
    if (existing) {
      throw new ConflictError('Ya existe una caja abierta. Ciérrala antes de abrir una nueva.');
    }

    const register = await this.repository.open({
      openedBy: userId,
      openingAmount: data.openingAmount,
      notes: data.notes ?? null,
    });

    return this.repository.findById(register.id);
  }

  /**
   * Close the open cash register.
   *
   * Steps (in a transaction):
   * 1. Ensure a register is open.
   * 2. Aggregate sales during the session grouped by payment method.
   * 3. Create a summary row per payment method.
   * 4. Compute expected cash (opening + cash sales) and difference.
   * 5. Mark the register CLOSED.
   */
  async close(userId: string, data: CloseCashRegisterDto) {
    return sequelize.transaction(async (t) => {
      const register = await this.repository.findOpen(t);
      if (!register) {
        throw new ConflictError('No hay ninguna caja abierta para cerrar.');
      }

      // Aggregate sales made during this session, grouped by payment method.
      // Uses raw SQL for a clean GROUP BY with SUM/COUNT.
      const rows = await sequelize.query<SalesByMethodRow>(
        `SELECT payment_method_id,
                COALESCE(SUM(total), 0) AS total_sales,
                COUNT(*) AS transaction_count
         FROM sale
         WHERE cash_register_id = :registerId
         GROUP BY payment_method_id`,
        {
          replacements: { registerId: register.id },
          type: QueryTypes.SELECT,
          transaction: t,
        },
      );

      // Resolve the cash payment method id (to compute expected physical cash)
      const cashMethod = await PaymentMethod.findOne({
        where: { name: CASH_METHOD_NAME },
        transaction: t,
      });
      const cashMethodId = cashMethod ? cashMethod.id : null;

      // Build summary rows and total cash sales
      let cashSales = 0;
      for (const row of rows) {
        const total = roundTo2(Number(row.total_sales));
        const count = Number(row.transaction_count);

        await CashRegisterSummary.create({
          cashRegisterId: register.id,
          paymentMethodId: row.payment_method_id,
          totalSales: total,
          transactionCount: count,
        } as any, { transaction: t });

        if (cashMethodId !== null && row.payment_method_id === cashMethodId) {
          cashSales = total;
        }
      }

      // expected = opening float + physical cash received
      const expectedAmount = roundTo2(Number(register.openingAmount) + cashSales);
      const difference = roundTo2(data.actualAmount - expectedAmount);

      await register.update(
        {
          closedBy: userId,
          expectedAmount,
          actualAmount: data.actualAmount,
          difference,
          status: 'CLOSED',
          notes: data.notes ?? register.notes,
          closedAt: new Date(),
        },
        { transaction: t },
      );

      // Return the closed register with summaries
      const closed = await CashRegister.findByPk(register.id, {
        include: [
          {
            model: CashRegisterSummary,
            as: 'summaries',
            include: [{ model: PaymentMethod, as: 'paymentMethod', attributes: ['id', 'name', 'displayName'] }],
          },
        ],
        transaction: t,
      });

      return closed;
    });
  }
}
