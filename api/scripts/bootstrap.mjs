/**
 * Bootstrap script for production container startup.
 *
 * Runs in order:
 * 1. Wait for database to be ready (retry with backoff)
 * 2. Run pending migrations
 * 3. Run pending seeders
 * 4. Start the HTTP server
 *
 * This ensures the container is self-sufficient — no need for
 * separate init containers or manual migration commands.
 */
import { execSync } from 'child_process';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

function log(message) {
  console.log(`[bootstrap] ${new Date().toISOString()} — ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for database to accept connections.
 * Uses tsx to run a quick connection test.
 */
async function waitForDatabase() {
  log('Waiting for database connection...');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      execSync('node --import tsx scripts/check-db.ts', {
        stdio: 'pipe',
        timeout: 15000,
      });
      log('Database is ready');
      return;
    } catch (error) {
      const detail = error.stderr?.toString().trim() || error.message;
      log(`Attempt ${attempt}/${MAX_RETRIES} failed: ${detail}`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  log('ERROR: Could not connect to database after maximum retries');
  process.exit(1);
}

/**
 * Run pending database migrations.
 */
function runMigrations() {
  log('Running migrations...');
  try {
    execSync('node --import tsx src/database/migrate.ts up', { stdio: 'inherit' });
    log('Migrations complete');
  } catch (error) {
    log('ERROR: Migrations failed');
    process.exit(1);
  }
}

/**
 * Run pending seeders.
 */
function runSeeders() {
  log('Running seeders...');
  try {
    execSync('node --import tsx src/database/seed.ts', { stdio: 'inherit' });
    log('Seeders complete');
  } catch (error) {
    log('ERROR: Seeders failed');
    process.exit(1);
  }
}

/**
 * Start the main application server.
 */
function startServer() {
  log('Starting server...');
  // Import dynamically to avoid loading the app before DB is ready
  import('../dist/index.js');
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  log('Bootstrap starting...');

  await waitForDatabase();
  runMigrations();
  runSeeders();
  startServer();
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});
