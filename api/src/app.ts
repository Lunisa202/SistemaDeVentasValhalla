import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { environment } from './config/environment';
import { logger } from './common/logger';
import { routes } from './routes';
import { errorHandler } from './common/middlewares/error-handler';
import { notFoundHandler } from './common/middlewares/not-found-handler';
import { setupSwagger } from './config/swagger';
import { rateLimiter } from './common/middlewares/rate-limiter';

export const app: Express = express();

// ─── Security ───────────────────────────────────────────────
app.use(helmet());
app.use(rateLimiter);

// ─── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: environment.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

// ─── Body parsing ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[REDACTED]',
    },
  }),
);

// ─── Swagger docs ───────────────────────────────────────────
setupSwagger(app);

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Error handling (must be AFTER routes) ──────────────────
app.use(notFoundHandler);
app.use(errorHandler);
