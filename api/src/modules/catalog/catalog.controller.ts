import type { Request, Response } from 'express';
import { CatalogService } from './catalog.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/helpers/response';
import { NotFoundError } from '../../common/errors/index';

/**
 * CatalogController — HTTP handlers for catalog/reference data.
 *
 * All methods are static because the controller holds no state.
 * They delegate to CatalogService and format the response.
 *
 * Principle: Single Responsibility — only handles HTTP concerns
 * (parse request, call service, format response).
 */
const service = new CatalogService();

export class CatalogController {
  static async getRoles(_req: Request, res: Response) {
    const roles = await service.getRoles();
    sendSuccess(res, roles);
  }

  static async getDocumentTypes(_req: Request, res: Response) {
    const types = await service.getDocumentTypes();
    sendSuccess(res, types);
  }

  static async getPaymentMethods(_req: Request, res: Response) {
    const methods = await service.getPaymentMethods();
    sendSuccess(res, methods);
  }

  static async getProductCategories(_req: Request, res: Response) {
    const categories = await service.getProductCategories();
    sendSuccess(res, categories);
  }

  static async createProductCategory(req: Request, res: Response) {
    const category = await service.createProductCategory(req.body);
    sendCreated(res, category);
  }

  static async updateProductCategory(req: Request, res: Response) {
    const { id } = req.params;
    const category = await service.updateProductCategory(Number(id), req.body);
    if (!category) throw new NotFoundError('Categoría');
    sendSuccess(res, category);
  }

  static async deleteProductCategory(req: Request, res: Response) {
    const { id } = req.params;
    const result = await service.deleteProductCategory(Number(id));
    if (!result) throw new NotFoundError('Categoría');
    sendNoContent(res);
  }
}
