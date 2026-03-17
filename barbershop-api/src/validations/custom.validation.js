const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const objectId = (value, helpers) => {
  if (!UUID_REGEX.test(value)) {
    return helpers.message('"{{#label}}" must be a valid UUID');
  }

  return value;
};

const password = (value, helpers) => {
  if (typeof value !== 'string' || value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }

  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }

  return value;
};

module.exports = {
  objectId,
  password,
};
