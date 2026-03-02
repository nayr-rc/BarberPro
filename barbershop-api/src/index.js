// Fix for Node.js 22/23 Buffer compatibility
global.Buffer = global.Buffer || require('buffer').Buffer;

const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const prisma = require('./client');

let server;

const startServer = async () => {
  try {
    // Tenta conectar ao SQLite
    await prisma.$connect();
    logger.info('✅ Conectado ao PostgreSQL via Prisma (Dados Persistentes)');

    server = app.listen(config.port, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.port}`);
    });
  } catch (err) {
    logger.error('❌ Falha ao iniciar o banco de dados PostgreSQL:', err);
    process.exit(1);
  }
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
