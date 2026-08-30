import { Transaction } from 'sequelize';
import { CashRegister } from './cash-register.model';
import { CashRegisterSummary } from './cash-register-summary.model';
import { User } from '../user/user.model';
import { PaymentMethod } from '../catalog/models/payment-method.model';
import { getOffset, type PaginationParams } from '../../common/helpers/pagination';

/**
 * CashRegisterRepository — data access for cash registers.
 *
 * Isolates all Sequelize queries. The service layer orchestrates
 * business rules on top of these primitives.
 */
export class CashRegisterRepository {
  private readonly userAttrs = ['id', 'firstName', 'lastName'];

  private readonly summaryInclude = {
    model: CashRegisterSummary,
    as: 'summaries',
    include: [{ model: PaymentMethod, as: 'paymentMethod', attributes: ['id', 'name', 'displayName'] }],
  };

  /** Find the currently OPEN register (there should be at most one). */
  async findOpen(transaction?: Transaction) {
    return CashRegister.findOne({
      where: { status: 'OPEN' },
      transaction,
    });
  }

  /** Full detail of the open register (with users + summaries). */
  async findOpenDetailed() {
    return CashRegister.findOne({
      where: { status: 'OPEN' },
      include: [
        { model: User, as: 'openedByUser', attributes: this.userAttrs },
        this.summaryInclude,
      ],
    });
  }

  async findById(id: number) {
    return CashRegister.findByPk(id, {
      include: [
        { model: User, as: 'openedByUser', attributes: this.userAttrs },
        { model: User, as: 'closedByUser', attributes: this.userAttrs },
        this.summaryInclude,
      ],
    });
  }

  async findAll(params: PaginationParams) {
    return CashRegister.findAndCountAll({
      include: [
        { model: User, as: 'openedByUser', attributes: this.userAttrs },
        { model: User, as: 'closedByUser', attributes: this.userAttrs },
      ],
      limit: params.limit,
      offset: getOffset(params),
      order: [['opened_at', 'DESC']],
    });
  }

  async open(data: { openedBy: string; openingAmount: number; notes?: string | null }) {
    return CashRegister.create(data as any);
  }
}
