import type { Request, Response } from 'express';
import { PurchaseService } from './purchase.service.js';
import { sendSuccess, sendCreated } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new PurchaseService();

export class PurchaseController {
  static async create(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await service.create(userId, req.body);
    sendCreated(res, result);
  }

  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const result = await service.getAll(params);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const purchase = await service.getById(Number(req.params.id));
    sendSuccess(res, purchase);
  }
}
