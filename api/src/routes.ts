import { Router, type Router as RouterType } from 'express';
import { catalogRoutes } from './modules/catalog/index.js';
import { authRoutes } from './modules/auth/index.js';
import { userRoutes } from './modules/user/index.js';
import { companyRoutes } from './modules/company/index.js';
import { providerRoutes } from './modules/provider/index.js';
import { clientRoutes } from './modules/client/index.js';
import { productRoutes } from './modules/product/index.js';
import { purchaseRoutes } from './modules/purchase/index.js';
import { saleRoutes } from './modules/sale/index.js';
import { authGuard } from './common/middlewares/auth-guard.js';

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

// TODO: cash-register and analytics modules
// routes.use('/cash-register', authGuard(['admin', 'seller']), cashRegisterRoutes);
// routes.use('/analytics', authGuard(['admin']), analyticsRoutes);
