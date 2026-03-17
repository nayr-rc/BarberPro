const axios = require('axios');
const logger = require('../config/logger');

/**
 * Envia notificação sobre eventos de assinatura/usuário.
 * @param {Object} payload 
 */
const notifySubscriptionEvent = async (payload) => {
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;

    const deliveryPromises = [];

    // Webhook Genérico
    if (webhookUrl) {
        deliveryPromises.push(
            axios.post(webhookUrl, payload, {
                headers: { 'Content-Type': 'application/json', 'X-Notification-Type': 'subscription' }
            }).catch(err => logger.error(`Erro Webhook: ${err.message}`))
        );
    }

    // Integração WhatsApp (Z-API ou similar)
    // Se o usuário quer ser notificado no número dele (71 9 9903-4067)
    if (whatsappApiUrl && whatsappApiToken) {
        const message = `🔔 *BarberPro Premium*\n\n` +
            `📌 *Evento:* ${payload.event}\n` +
            `👤 *Usuário:* ${payload.userName}\n` +
            `📧 *Email:* ${payload.userEmail}\n` +
            `📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n` +
            `💰 *Valor:* R$ 25,00`;

        deliveryPromises.push(
            axios.post(whatsappApiUrl, {
                phone: '5571999034067',
                message: message
            }, {
                headers: { 'Authorization': `Bearer ${whatsappApiToken}` }
            }).catch(err => logger.error(`Erro WhatsApp: ${err.message}`))
        );
    }

    if (deliveryPromises.length > 0) {
        await Promise.allSettled(deliveryPromises);
    }
};

module.exports = {
    notifySubscriptionEvent
};
