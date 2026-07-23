import { Router } from 'express';

import { userRoutes } from './modules/users/user.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { companyRoutes } from './modules/company/company.routes.js';
import { verifyToken } from './middlewares/verifyToken.js';
import { providerRoutes } from './modules/provider/provider.routes.js';
import { productRoutes } from './modules/product/product.routes.js';
import { buysRoutes } from './modules/buys/buys.routes.js';
import { clientRoutes } from './modules/client/client.routes.js';
import { salesRoutes } from './modules/sales/sales.routes.js';

export const routes = Router();
// solo los administradores podrán tener acceso a todas las rutas del UserRoutes
routes.use('/users', verifyToken(['administrador']),userRoutes);
routes.use('/auth', authRoutes);
routes.use('/companies', verifyToken(['administrador']), companyRoutes);
routes.use('/products', verifyToken(['administrador']), productRoutes);
routes.use('/providers', providerRoutes);
routes.use('/buys', verifyToken(['administrador']), buysRoutes);
routes.use('/clients', verifyToken(['administrador','vendedor']), clientRoutes);
routes.use('/sales', verifyToken(['administrador', 'vendedor']), salesRoutes);
