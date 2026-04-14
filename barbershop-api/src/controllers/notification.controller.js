const catchAsync = require('../utils/catchAsync');
const { sendAppointmentEmail } = require('../services/email.service');
const { sendPushNotification, prepareNotificationPayload } = require('../services/push.service');
const { sendExpoPushNotification } = require('../services/expoPush.service');
const { getUserById } = require('../services/user.service');

const sendAppointmentNotificationToUser = catchAsync(async (params) => {
  const { userId, type, appointmentDetails, barberDetails, serviceDetails, notificationType } = params;
  const user = await getUserById(userId);

  if (user.emailNotificationsEnabled) {
    await sendAppointmentEmail(notificationType, user.email, appointmentDetails, barberDetails, serviceDetails);
  }

  if (user.pushNotificationsEnabled) {
    const payload = prepareNotificationPayload(type, appointmentDetails);
    
    if (user.pushSubscription) {
      await sendPushNotification(user.pushSubscription, payload);
    }
    
    if (user.expoPushToken) {
      await sendExpoPushNotification(user.expoPushToken, payload);
    }
  }
});

const sendAppointmentNotificationToBarber = catchAsync(async (params) => {
  const { barberId, type, appointmentDetails, serviceDetails, notificationType } = params;
  const barber = await getUserById(barberId);

  if (barber.emailNotificationsEnabled) {
    // Pass the correct name for the barber to the email service
    await sendAppointmentEmail(notificationType, barber.email, appointmentDetails, barber, serviceDetails, true);
  }

  if (barber.pushNotificationsEnabled) {
    const payload = prepareNotificationPayload(type, appointmentDetails);
    
    if (barber.pushSubscription) {
      await sendPushNotification(barber.pushSubscription, payload);
    }
    
    if (barber.expoPushToken) {
      await sendExpoPushNotification(barber.expoPushToken, payload);
    }
  }
});

module.exports = {
  sendAppointmentNotificationToUser,
  sendAppointmentNotificationToBarber,
};
