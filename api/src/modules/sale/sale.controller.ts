import type { Request, Response } from 'express';
import { SaleService } from './sale.service';
import { CashRegisterService } from '../cash-register/cash-register.service';
import { sendSuccess, sendCreated } from '../../common/helpers/response';
import { parsePaginationParams } from '../../common/helpers/pagination';
import { AppError } from '../../common/errors/app-error';

const service = new SaleService();
const cashRegisterService = new CashRegisterService();

export class SaleController {
  static async create(req: Request, res: Response) {
    const sellerId = req.user!.id;

    // A sale requires an OPEN cash register — resolve the active session.
    const cashRegisterId = await cashRegisterService.getActiveId();
    if (cashRegisterId === null) {
      throw new AppError(
        409,
        'NO_OPEN_CASH_REGISTER',
        'No hay una caja abierta. Abre una caja antes de registrar ventas.',
      );
    }

    const result = await service.create(sellerId, cashRegisterId, req.body);
    sendCreated(res, result);
  }

  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const result = await service.getAll(params);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const sale = await service.getById(Number(req.params.id));
    sendSuccess(res, sale);
  }
}
