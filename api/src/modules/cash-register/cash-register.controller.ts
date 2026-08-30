import type { Request, Response } from 'express';
import { CashRegisterService } from './cash-register.service';
import { sendSuccess, sendCreated } from '../../common/helpers/response';
import { parsePaginationParams } from '../../common/helpers/pagination';

const service = new CashRegisterService();

export class CashRegisterController {
  /** GET /cash-register/status — is a register open? (frontend gate for sales) */
  static async getStatus(_req: Request, res: Response) {
    const status = await service.getStatus();
    sendSuccess(res, status);
  }

  /** GET /cash-register/current — the currently open register with summaries */
  static async getCurrent(_req: Request, res: Response) {
    const current = await service.getCurrent();
    sendSuccess(res, current);
  }

  /** GET /cash-register — paginated history */
  static async getAll(req: Request, res: Response) {
    const params = parsePaginationParams(req.query as Record<string, unknown>);
    const result = await service.getAll(params);
    sendSuccess(res, result.data, result.meta);
  }

  /** GET /cash-register/:id — a specific register with details */
  static async getById(req: Request, res: Response) {
    const register = await service.getById(Number(req.params.id));
    sendSuccess(res, register);
  }

  /** POST /cash-register/open — open a new register */
  static async open(req: Request, res: Response) {
    const userId = req.user!.id;
    const register = await service.open(userId, req.body);
    sendCreated(res, register);
  }

  /** POST /cash-register/close — close the open register */
  static async close(req: Request, res: Response) {
    const userId = req.user!.id;
    const register = await service.close(userId, req.body);
    sendSuccess(res, register);
  }
}
