const { objectId, password } = require('../../../src/validations/custom.validation');

describe('custom validation helpers', () => {
  const helpers = {
    message: (msg) => msg,
  };

  describe('objectId', () => {
    test('returns value for valid UUID', () => {
      const value = '123e4567-e89b-42d3-a456-426614174000';

      expect(objectId(value, helpers)).toBe(value);
    });

    test('returns validation message for invalid id', () => {
      const value = '507f1f77bcf86cd799439011';

      expect(objectId(value, helpers)).toBe('"{{#label}}" must be a valid UUID');
    });
  });

  describe('password', () => {
    test('returns value when password has min length and alphanumeric mix', () => {
      const value = 'password123';

      expect(password(value, helpers)).toBe(value);
    });

    test('returns validation message for short password', () => {
      expect(password('abc123', helpers)).toBe('password must be at least 8 characters');
    });

    test('returns validation message when password has no number', () => {
      expect(password('passwordonly', helpers)).toBe('password must contain at least 1 letter and 1 number');
    });

    test('returns validation message when password has no letter', () => {
      expect(password('12345678', helpers)).toBe('password must contain at least 1 letter and 1 number');
    });
  });
});
