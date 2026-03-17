const httpStatus = require('http-status');
const checkSubscription = require('../../../src/middlewares/checkSubscription');
const ApiError = require('../../../src/utils/ApiError');

describe('checkSubscription middleware', () => {
  const res = {};

  test('returns unauthorized when request has no user', () => {
    const req = {};
    const next = jest.fn();

    checkSubscription(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(ApiError);
    expect(errorArg.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  test('allows non-barber users', () => {
    const req = {
      user: {
        role: 'admin',
      },
    };
    const next = jest.fn();

    checkSubscription(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('allows active subscription when expiration is in the future', () => {
    const req = {
      user: {
        role: 'barber',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    const next = jest.fn();

    checkSubscription(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('blocks active subscription when expiration is in the past', () => {
    const req = {
      user: {
        role: 'barber',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    const next = jest.fn();

    checkSubscription(req, res, next);

    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(ApiError);
    expect(errorArg.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  test('blocks pending subscriptions', () => {
    const req = {
      user: {
        role: 'barber',
        subscriptionStatus: 'pending',
      },
    };
    const next = jest.fn();

    checkSubscription(req, res, next);

    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(ApiError);
    expect(errorArg.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
  });
});
