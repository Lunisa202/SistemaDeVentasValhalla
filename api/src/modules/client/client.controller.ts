import type { Request, Response } from 'express';
import { ClientService } from './client.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new ClientService();

export class ClientController {
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const search = req.query.search as string | undefined;
    const result = await service.getAll(params, search);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const client = await service.getById(req.params.id as string);
    sendSuccess(res, client);
  }

  static async create(req: Request, res: Response) {
    const client = await service.create(req.body);
    sendCreated(res, client);
  }

  static async update(req: Request, res: Response) {
    const client = await service.update(req.params.id as string, req.body);
    sendSuccess(res, client);
  }

  static async delete(req: Request, res: Response) {
    await service.delete(req.params.id as string);
    sendNoContent(res);
  }
}
