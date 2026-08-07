import { Router, type Router as RouterType } from 'express';

export const routes: RouterType = Router();

// Health check
routes.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Module routes will be registered here as they are implemented
// routes.use('/auth', authRoutes);
// routes.use('/users', authGuard(['admin']), userRoutes);
// routes.use('/products', authGuard(['admin']), productRoutes);
// routes.use('/clients', authGuard(['admin', 'seller']), clientRoutes);
// routes.use('/providers', authGuard(['admin']), providerRoutes);
// routes.use('/companies', authGuard(['admin']), companyRoutes);
// routes.use('/purchases', authGuard(['admin']), purchaseRoutes);
// routes.use('/sales', authGuard(['admin', 'seller']), saleRoutes);
// routes.use('/cash-register', authGuard(['admin', 'seller']), cashRegisterRoutes);
// routes.use('/analytics', authGuard(['admin']), analyticsRoutes);
// routes.use('/catalog', catalogRoutes);
