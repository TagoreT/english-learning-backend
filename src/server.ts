import { buildApp } from './app';
import { env } from './config/env';
import { disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';

async function start() {
  try {
    const app = await buildApp();

    // Start server
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎓 English Learning Platform API                   ║
║                                                       ║
║   Environment: ${env.NODE_ENV.padEnd(38)}║
║   Server:      http://${env.HOST}:${env.PORT}${' '.repeat(21)}║
║   API Docs:    http://${env.HOST}:${env.PORT}/docs${' '.repeat(16)}║
║   API Version: ${env.API_VERSION.padEnd(38)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n${signal} received. Starting graceful shutdown...`);

        try {
          await app.close();
          await disconnectDatabase();
          await disconnectRedis();
          console.log('Graceful shutdown completed.');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
