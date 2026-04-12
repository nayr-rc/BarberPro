const BRAZIL_PHONE_MIN_LENGTH = 10;
const BRAZIL_PHONE_MAX_LENGTH = 11;

export const normalizePhoneDigits = (value: string) => value.replace(/\D/g, "").slice(0, BRAZIL_PHONE_MAX_LENGTH);

export const formatBrazilPhone = (value: string) => {
  const digits = normalizePhoneDigits(value);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const isValidBrazilPhone = (value: string) => {
  const digits = normalizePhoneDigits(value);
  return digits.length >= BRAZIL_PHONE_MIN_LENGTH && digits.length <= BRAZIL_PHONE_MAX_LENGTH;
};

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) => {
  const normalized = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalized);
};
