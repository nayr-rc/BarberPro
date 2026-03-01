// Fix for Node.js 22/23 Buffer compatibility
global.Buffer = global.Buffer || require('buffer').Buffer;

const mongoose = require('mongoose');
const axios = require('axios'); // Add axios import
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

// Set Mongoose 6 strictQuery option
mongoose.set('strictQuery', false);

// Set Mongoose 6 strictQuery option
mongoose.set('strictQuery', false);

const { MongoMemoryServer } = require('mongodb-memory-server');

let server;

const startServer = async () => {
  let mongoUrl = config.mongoose.url;

  if (config.env === 'development' && mongoUrl.includes('127.0.0.1')) {
    try {
      logger.info('Tentando iniciar MongoDB em Memória para seu conforto...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUrl = mongoServer.getUri();
      logger.info(`✅ MongoDB em Memória rodando em: ${mongoUrl}`);
    } catch (e) {
      logger.error('Erro ao subir Mongo em memória, tentando conexão padrão...', e.message);
    }
  }

  mongoose.connect(mongoUrl, config.mongoose.options).then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  });
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
