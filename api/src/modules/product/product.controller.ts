import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new ProductService();

export class ProductController {
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const categoryId = req.query.category_id ? Number(req.query.category_id) : undefined;
    const search = req.query.search as string | undefined;
    const result = await service.getAll(params, { categoryId, search });
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const product = await service.getById(req.params.id as string);
    sendSuccess(res, product);
  }

  /** GET /products/code/:code — for QR/barcode scanning at POS */
  static async getByCode(req: Request, res: Response) {
    const product = await service.getByCode(req.params.code as string);
    sendSuccess(res, product);
  }

  static async create(req: Request, res: Response) {
    const product = await service.create(req.body);
    sendCreated(res, product);
  }

  static async update(req: Request, res: Response) {
    const product = await service.update(req.params.id as string, req.body);
    sendSuccess(res, product);
  }

  static async delete(req: Request, res: Response) {
    await service.delete(req.params.id as string);
    sendNoContent(res);
  }
}
