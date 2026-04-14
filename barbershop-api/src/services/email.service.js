const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
const frontendBaseUrl = String(config.app?.frontendUrl || 'http://localhost:3000').replace(/\/+$/, '');
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

const createFrontendUrl = (path) => `${frontendBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

const formatDateTime = (dateTime) => dayjs(dateTime).format('dddd, MMMM D, YYYY h:mm A');

const generateActionLink = (type) => {
  if (type === 'confirmation' || type === 'update' || type === 'new_appointment' || type === 'appointment_updated') {
    return `<a href="https://appointment-management-fe.vercel.app/appointments" style="display: inline-block; padding: 10px 20px; background-color: #AF8447; color: #fff; text-decoration: none;">View Appointments</a>`;
  }
  if (type === 'feedback') {
    return `<a href="https://appointment-management-fe.vercel.app/reviews" style="display: inline-block; padding: 10px 20px; background-color: #AF8447; color: #fff; text-decoration: none;">Leave a Review</a>`;
  }
  return '';
};

const generateClosingMessage = (type, isBarber) => {
  if (isBarber) {
    return 'Please view all your appointments.';
  }

  switch (type) {
    case 'cancellation':
      return 'We hope to see you soon for a rescheduled appointment.';
    case 'feedback':
      return 'Thank you for choosing our service!';
    default:
      return 'Looking forward to seeing you!';
  }
};

const generateAppointmentEmailHtml = (type, appointmentDetails, recipientDetails, serviceDetails, isBarber) => {
  const formattedDateTime = formatDateTime(appointmentDetails.appointmentDateTime);
  const actionLink = generateActionLink(type);

  // Use the correct name based on whether the recipient is a barber or a user
  const recipientName = isBarber
    ? `${recipientDetails.firstName} ${recipientDetails.lastName}`
    : `${appointmentDetails.firstName} ${appointmentDetails.lastName}`;

  const emailTypes = {
    confirmation: {
      title: 'Appointment Confirmation - Barbershop',
      message: 'Your appointment has been confirmed with the following details:',
    },
    update: {
      title: 'Appointment Update - Barbershop',
      message: 'Your appointment has been updated with the following details:',
    },
    cancellation: {
      title: 'Appointment Cancellation - Barbershop',
      message:
        'We regret to inform you that your appointment has been cancelled. Here are the details of the cancelled appointment:',
    },
    feedback: {
      title: 'We Value Your Feedback - Barbershop',
      message:
        'Your appointment has passed. We would love to hear your feedback on the service provided. Please consider leaving a review:',
    },
    new_appointment: {
      title: 'New Appointment - Barbershop',
      message: `A new appointment has been booked by ${appointmentDetails.firstName} ${appointmentDetails.lastName}. Here are the details:`,
    },
    appointment_updated: {
      title: 'Appointment Updated - Barbershop',
      message: `An appointment has been updated by ${appointmentDetails.firstName} ${appointmentDetails.lastName}. Here are the details:`,
    },
  };

  const { title, message } = emailTypes[type];

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>${title}</h2>
      <p>Dear ${recipientName},</p>
      <p>${message}</p>
      <ul>
        <li><strong>Date & Time:</strong> ${formattedDateTime}</li>
        <li><strong>Service:</strong> ${serviceDetails.title}</li>
        <li><strong>Contact Number:</strong> ${appointmentDetails.contactNumber}</li>
      </ul>
      ${actionLink}
      <p>${generateClosingMessage(type, isBarber)}</p>
    </div>
  `;
};

const sendAppointmentEmail = async (type, to, appointmentDetails, recipientDetails, serviceDetails, isBarber = false) => {
  let subject;

  // Determine the subject based on the type
  switch (type) {
    case 'appointment_updated':
      subject = 'Barbershop Appointment Updated';
      break;
    case 'new_appointment':
      subject = 'New Barbershop Appointment';
      break;
    default:
      subject = `Barbershop Appointment ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      break;
  }

  // Generate the HTML content
  const html = generateAppointmentEmailHtml(type, appointmentDetails, recipientDetails, serviceDetails, isBarber);

  // Send the email
  await sendEmail(to, subject, html);
};

const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Recuperacao de senha - BarberPro';
  const resetPasswordUrl = createFrontendUrl(`/auth/reset-password?token=${encodeURIComponent(token)}`);
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 16px; color: #111827;">Recuperacao de senha</h2>
      <p>Recebemos uma solicitacao para redefinir a senha da sua conta no BarberPro.</p>
      <p>Para criar uma nova senha, clique no botao abaixo:</p>
      <p style="margin: 24px 0;">
        <a href="${resetPasswordUrl}" style="display: inline-block; padding: 12px 20px; background-color: #AF8447; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: bold;">
          Redefinir senha
        </a>
      </p>
      <p>Se preferir, copie e cole este link no navegador:</p>
      <p style="word-break: break-all;">${resetPasswordUrl}</p>
      <p>Se voce nao solicitou essa alteracao, pode ignorar este e-mail com seguranca.</p>
    </div>
  `;
  await sendEmail(to, subject, html);
};

const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `https://appointment-management-fe.vercel.app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendAppointmentEmail,
  sendVerificationEmail,
};
