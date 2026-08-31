import { Sequelize } from 'sequelize-typescript';
import { environment } from './environment';
import { logger } from '../common/logger';

// Model imports
import { Role } from '../modules/catalog/models/role.model';
import { DocumentType } from '../modules/catalog/models/document-type.model';
import { PaymentMethod } from '../modules/catalog/models/payment-method.model';
import { ProductCategory } from '../modules/catalog/models/product-category.model';
import { Company } from '../modules/company/company.model';
import { User } from '../modules/user/user.model';
import { Provider } from '../modules/provider/provider.model';
import { Client } from '../modules/client/client.model';
import { Product } from '../modules/product/product.model';
import { Purchase } from '../modules/purchase/purchase.model';
import { PurchaseDetail } from '../modules/purchase/purchase-detail.model';
import { Sale } from '../modules/sale/sale.model';
import { SaleDetail } from '../modules/sale/sale-detail.model';
import { RefreshToken } from '../modules/auth/refresh-token.model';
import { CashRegister } from '../modules/cash-register/cash-register.model';
import { CashRegisterSummary } from '../modules/cash-register/cash-register-summary.model';

/**
 * Sequelize instance configured for PostgreSQL.
 * Uses sequelize-typescript which allows decorators in models.
 *
 * The `models` array registers all model classes so Sequelize
 * knows about them and their relationships.
 */
export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  database: environment.DB_NAME,
  username: environment.DB_USER,
  password: environment.DB_PASS,
  logging: environment.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  models: [
    Role,
    DocumentType,
    PaymentMethod,
    ProductCategory,
    Company,
    User,
    Provider,
    Client,
    Product,
    Purchase,
    PurchaseDetail,
    Sale,
    SaleDetail,
    RefreshToken,
    CashRegister,
    CashRegisterSummary,
  ],
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: environment.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

/**
 * Initialize database connection and register models.
 * Called once at server startup (bootstrap).
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.fatal({ err: error }, 'Unable to connect to database');
    throw error;
  }
}
