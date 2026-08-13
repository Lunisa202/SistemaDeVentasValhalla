import type { Request, Response } from 'express';
import { SaleService } from './sale.service.js';
import { sendSuccess, sendCreated } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new SaleService();

export class SaleController {
  static async create(req: Request, res: Response) {
    const sellerId = req.user!.id;
    // TODO: Get active cash register ID from CashRegisterService
    const cashRegisterId = null;
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
