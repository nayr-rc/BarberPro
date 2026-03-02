// Fix for Node.js 22/23 Buffer compatibility
global.Buffer = global.Buffer || require('buffer').Buffer;

const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const prisma = require('./client');

let server;

// Função para iniciar o servidor (usada para local e outros provedores)
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Conectado ao PostgreSQL via Prisma');

    server = app.listen(config.port, () => {
      logger.info(`🚀 Servidor rodando na porta ${config.port}`);
    });
  } catch (err) {
    logger.error('❌ Falha ao iniciar o banco de dados:', err);
    // No Vercel, não queremos dar process.exit(1) aqui
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Só inicia o servidor se não estiver na Vercel
if (!process.env.VERCEL) {
  startServer();
} else {
  // Na Vercel, o prisma se conecta na primeira requisição, 
  // mas podemos forçar o connect se preferir
  prisma.$connect().catch(err => logger.error('Prisma lazy connect error:', err));
}

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

module.exports = app;
