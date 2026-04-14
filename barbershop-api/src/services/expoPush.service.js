const axios = require('axios');
const logger = require('../config/logger');

/**
 * Send push notification via Expo Push API
 * @param {string} expoPushToken - The target Expo push token
 * @param {object} payload - The notification payload { title, body, data }
 */
const sendExpoPushNotification = async (expoPushToken, payload) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
  };

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    logger.info(`Push notification sent to ${expoPushToken}`);
  } catch (error) {
    logger.error('Error sending Expo push notification:', error.response ? error.response.data : error.message);
  }
};

module.exports = {
  sendExpoPushNotification,
};
