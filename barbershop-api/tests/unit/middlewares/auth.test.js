const httpStatus = require('http-status');
const passport = require('passport');
const ApiError = require('../../../src/utils/ApiError');
const auth = require('../../../src/middlewares/auth');

jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

describe('auth middleware', () => {
  const res = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('allows authenticated user when no rights are required', async () => {
    const req = { params: {} };
    const next = jest.fn();

    passport.authenticate.mockImplementation((strategy, options, verifyCallback) => {
      return () => verifyCallback(null, { id: 'user-1', role: 'barber' }, null);
    });

    await auth()(req, res, next);

    expect(req.user).toMatchObject({ id: 'user-1', role: 'barber' });
    expect(next).toHaveBeenCalledWith();
  });

  test('returns unauthorized when passport does not resolve a user', async () => {
    const req = { params: {} };
    const next = jest.fn();

    passport.authenticate.mockImplementation((strategy, options, verifyCallback) => {
      return () => verifyCallback(null, false, null);
    });

    await auth('manageUsers')(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  test('returns forbidden when user has no required right and is not owner', async () => {
    const req = { params: { userId: 'target-user' } };
    const next = jest.fn();

    passport.authenticate.mockImplementation((strategy, options, verifyCallback) => {
      return () => verifyCallback(null, { id: 'requester-user', role: 'barber' }, null);
    });

    await auth('manageUsers')(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(httpStatus.FORBIDDEN);
  });

  test('allows self access even without required right', async () => {
    const req = { params: { userId: 'same-user' } };
    const next = jest.fn();

    passport.authenticate.mockImplementation((strategy, options, verifyCallback) => {
      return () => verifyCallback(null, { id: 'same-user', role: 'barber' }, null);
    });

    await auth('manageUsers')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
