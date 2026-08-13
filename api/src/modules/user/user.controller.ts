import type { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response.js';
import { parsePaginationParams } from '../../common/helpers/pagination.js';

const service = new UserService();

export class UserController {
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const result = await service.getAll(params);
    sendSuccess(res, result.data, result.meta);
  }

  static async getById(req: Request, res: Response) {
    const user = await service.getById(req.params.id as string);
    sendSuccess(res, user);
  }

  static async create(req: Request, res: Response) {
    const user = await service.create(req.body);
    sendCreated(res, user);
  }

  static async update(req: Request, res: Response) {
    const user = await service.update(req.params.id as string, req.body);
    sendSuccess(res, user);
  }

  static async delete(req: Request, res: Response) {
    await service.delete(req.params.id as string);
    sendNoContent(res);
  }
}
