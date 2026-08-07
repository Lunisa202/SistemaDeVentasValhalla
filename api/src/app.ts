import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { environment } from './config/environment.js';
import { logger } from './common/logger.js';
import { routes } from './routes.js';
import { errorHandler } from './common/middlewares/error-handler.js';
import { notFoundHandler } from './common/middlewares/not-found-handler.js';
import { setupSwagger } from './config/swagger.js';
import { rateLimiter } from './common/middlewares/rate-limiter.js';

export const app: Express = express();

// ─── Security ───────────────────────────────────────────────
app.use(helmet());
app.use(rateLimiter);

// ─── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: environment.ALLOWED_ORIGINS,
  credentials: true,
}));

// ─── Body parsing ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Swagger docs ───────────────────────────────────────────
setupSwagger(app);

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Error handling (must be AFTER routes) ──────────────────
app.use(notFoundHandler);
app.use(errorHandler);
