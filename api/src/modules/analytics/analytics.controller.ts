import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../common/helpers/response';

const service = new AnalyticsService();

/** Extract from/to date range from query string. */
function range(req: Request) {
  return {
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  };
}

export class AnalyticsController {
  static async overview(_req: Request, res: Response) {
    const data = await service.getOverview();
    sendSuccess(res, data);
  }

  static async salesByPeriod(req: Request, res: Response) {
    const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day';
    const data = await service.getSalesByPeriod(range(req), groupBy);
    sendSuccess(res, data);
  }

  static async topProducts(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await service.getTopProducts(range(req), limit);
    sendSuccess(res, data);
  }

  static async salesByPaymentMethod(req: Request, res: Response) {
    const data = await service.getSalesByPaymentMethod(range(req));
    sendSuccess(res, data);
  }

  static async salesByCategory(req: Request, res: Response) {
    const data = await service.getSalesByCategory(range(req));
    sendSuccess(res, data);
  }

  static async profitLoss(req: Request, res: Response) {
    const data = await service.getProfitLoss(range(req));
    sendSuccess(res, data);
  }

  static async lowStock(req: Request, res: Response) {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
    const data = await service.getLowStock(threshold);
    sendSuccess(res, data);
  }

  static async salesBySeller(req: Request, res: Response) {
    const data = await service.getSalesBySeller(range(req));
    sendSuccess(res, data);
  }
}
