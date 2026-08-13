import { Router, type Router as RouterType } from 'express';
import { CompanyController } from './company.controller.js';
import { asyncHandler } from '../../common/middlewares/async-handler.js';
import { validateSchema } from '../../common/middlewares/validate-schema.js';
import { createCompanySchema, updateCompanySchema } from './company.schema.js';

export const companyRoutes: RouterType = Router();

companyRoutes.get('/', asyncHandler(CompanyController.getAll));
companyRoutes.get('/:id', asyncHandler(CompanyController.getById));
companyRoutes.post('/', validateSchema(createCompanySchema), asyncHandler(CompanyController.create));
companyRoutes.patch('/:id', validateSchema(updateCompanySchema), asyncHandler(CompanyController.update));
companyRoutes.delete('/:id', asyncHandler(CompanyController.delete));
