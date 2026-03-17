const serverless = require('serverless-http');
const app = require('../app');
const prisma = require('../client');

// Certifica que o Prisma está conectado
const handler = serverless(app, {
    async request(request, event, context) {
        context.callbackWaitsForEmptyEventLoop = false;
        await prisma.$connect();
        return request;
    },
});

module.exports.handler = handler;
