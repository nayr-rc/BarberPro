const formatCurrency = (value) => {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
};

const formatDate = (date) => {
  if (!date) return '';

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

const buildBookingMessage = ({ clientName, service, price, date, time }) => {
  return [
    'Novo agendamento',
    '',
    `Cliente: ${clientName}`,
    `Corte: ${service}`,
    `Valor: ${formatCurrency(price)}`,
    `Data: ${formatDate(date)}`,
    `Horário: ${time}`,
  ].join('\n');
};

const createWhatsAppLink = ({ barberPhone, clientName, service, price, date, time }) => {
  const phone = normalizePhone(barberPhone);
  const message = buildBookingMessage({ clientName, service, price, date, time });
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

module.exports = {
  createWhatsAppLink,
  buildBookingMessage,
};