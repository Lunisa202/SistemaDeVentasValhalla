import { app } from './app.js';
import { environment } from './config/environment.js';
import { logger } from './common/logger.js';
import { initializeDatabase } from './config/database.js';

async function bootstrap() {
  // Connect to database and run migrations
  await initializeDatabase();

  // Start HTTP server
  app.listen(environment.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${environment.PORT}`);
    logger.info(`📚 Swagger docs at http://localhost:${environment.PORT}/api/v1/docs`);
    logger.info(`🌍 Environment: ${environment.NODE_ENV}`);
  });
}

bootstrap().catch((error) => {
  logger.fatal('❌ Failed to start server:', error);
  process.exit(1);
});
