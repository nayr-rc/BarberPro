const httpStatus = require('http-status');

jest.mock('../../../src/services', () => ({
  authService: {},
  userService: {},
  tokenService: {
    generateResetPasswordToken: jest.fn(),
  },
  emailService: {
    sendResetPasswordEmail: jest.fn(),
  },
}));

const authController = require('../../../src/controllers/auth.controller');
const { tokenService, emailService } = require('../../../src/services');
const ApiError = require('../../../src/utils/ApiError');

describe('auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    test('returns 204 and sends email when account exists', async () => {
      const req = { body: { email: 'barbeiro@teste.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      tokenService.generateResetPasswordToken.mockResolvedValue('reset-token');

      await authController.forgotPassword(req, res, next);
      await new Promise(process.nextTick);

      expect(tokenService.generateResetPasswordToken).toHaveBeenCalledWith(req.body.email);
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(req.body.email, 'reset-token');
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 204 without leaking account existence when email is unknown', async () => {
      const req = { body: { email: 'inexistente@teste.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const next = jest.fn();

      tokenService.generateResetPasswordToken.mockRejectedValue(new ApiError(httpStatus.NOT_FOUND, 'No users found with this email'));

      await authController.forgotPassword(req, res, next);
      await new Promise(process.nextTick);

      expect(emailService.sendResetPasswordEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
