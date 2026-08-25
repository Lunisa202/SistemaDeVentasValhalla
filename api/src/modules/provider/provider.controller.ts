import type { Request, Response } from 'express';
import { ProviderService } from './provider.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response';
import { parsePaginationParams } from '../../common/helpers/pagination';

const service = new ProviderService();

export class ProviderController {
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const companyId = req.query.company_id as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await service.getAll(params, companyId, search);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const provider = await service.getById(req.params.id as string);
    sendSuccess(res, provider);
  }

  static async create(req: Request, res: Response) {
    const provider = await service.create(req.body);
    sendCreated(res, provider);
  }

  static async update(req: Request, res: Response) {
    const provider = await service.update(req.params.id as string, req.body);
    sendSuccess(res, provider);
  }

  static async delete(req: Request, res: Response) {
    await service.delete(req.params.id as string);
    sendNoContent(res);
  }
}
