import type { Request, Response } from 'express';
import { CompanyService } from './company.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new CompanyService();

export class CompanyController {
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const result = await service.getAll(params);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const company = await service.getById(req.params.id as string);
    sendSuccess(res, company);
  }

  static async create(req: Request, res: Response) {
    const company = await service.create(req.body);
    sendCreated(res, company);
  }

  static async update(req: Request, res: Response) {
    const company = await service.update(req.params.id as string, req.body);
    sendSuccess(res, company);
  }

  static async delete(req: Request, res: Response) {
    await service.delete(req.params.id as string);
    sendNoContent(res);
  }
}
