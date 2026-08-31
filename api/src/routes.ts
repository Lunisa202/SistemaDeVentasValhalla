import { Router, type Router as RouterType } from 'express';
import { catalogRoutes } from './modules/catalog';
import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/user';
import { companyRoutes } from './modules/company';
import { providerRoutes } from './modules/provider';
import { clientRoutes } from './modules/client';
import { productRoutes } from './modules/product';
import { purchaseRoutes } from './modules/purchase';
import { saleRoutes } from './modules/sale';
import { cashRegisterRoutes } from './modules/cash-register';
import { analyticsRoutes } from './modules/analytics';
import { authGuard } from './common/middlewares/auth-guard';

export const routes: RouterType = Router();

// Health check
routes.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Public routes
routes.use('/catalog', catalogRoutes);
routes.use('/auth', authRoutes);

// Protected routes
routes.use('/users', authGuard(['admin']), userRoutes);
routes.use('/companies', authGuard(['admin']), companyRoutes);
routes.use('/providers', authGuard(['admin']), providerRoutes);
routes.use('/clients', authGuard(['admin', 'seller']), clientRoutes);
routes.use('/products', authGuard(['admin']), productRoutes);
routes.use('/purchases', authGuard(['admin']), purchaseRoutes);
routes.use('/sales', authGuard(['admin', 'seller']), saleRoutes);
routes.use('/cash-register', authGuard(['admin', 'seller']), cashRegisterRoutes);
routes.use('/analytics', authGuard(['admin']), analyticsRoutes);
