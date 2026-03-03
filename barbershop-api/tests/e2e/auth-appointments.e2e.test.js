const { randomUUID: mockRandomUUID } = require('crypto');
const request = require('supertest');
const httpStatus = require('http-status');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

jest.mock('../../src/controllers/notification.controller', () => ({
  sendAppointmentNotificationToUser: jest.fn().mockResolvedValue(undefined),
  sendAppointmentNotificationToBarber: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/utils/notifications', () => ({
  notifySubscriptionEvent: jest.fn(),
}));

jest.mock('../../src/client', () => {
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const state = {
    users: [],
    tokens: [],
    categories: [],
    services: [],
    appointments: [],
    drinks: [],
    tokenId: 1,
  };

  const parseMaybeDate = (value) => {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  };

  const matchesWhere = (record, where = {}) => {
    return Object.entries(where).every(([key, expected]) => {
      if (expected === undefined) {
        return true;
      }

      const actual = record[key];

      if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
        if (Object.prototype.hasOwnProperty.call(expected, 'not')) {
          return actual !== expected.not;
        }

        if (Object.prototype.hasOwnProperty.call(expected, 'gte') || Object.prototype.hasOwnProperty.call(expected, 'lte')) {
          const actualDate = parseMaybeDate(actual);
          if (!actualDate) {
            return false;
          }

          const gteDate = parseMaybeDate(expected.gte);
          const lteDate = parseMaybeDate(expected.lte);
          if (gteDate && actualDate < gteDate) {
            return false;
          }
          if (lteDate && actualDate > lteDate) {
            return false;
          }
          return true;
        }

        return Object.entries(expected).every(([nestedKey, nestedValue]) => {
          if (nestedKey === 'not') {
            return actual !== nestedValue;
          }
          return record[key] && record[key][nestedKey] === nestedValue;
        });
      }

      return actual === expected;
    });
  };

  const applyOrderBy = (rows, orderBy) => {
    if (!orderBy || !Object.keys(orderBy).length) {
      return rows;
    }

    const [field] = Object.keys(orderBy);
    const direction = orderBy[field] === 'desc' ? -1 : 1;

    return [...rows].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) {
        return 0;
      }
      return av > bv ? direction : -direction;
    });
  };

  const withPagination = (rows, skip = 0, take = rows.length) => {
    return rows.slice(skip, skip + take);
  };

  const buildServiceResult = (service, include) => {
    const result = clone(service);
    if (include && include.category) {
      result.category = state.categories.find((category) => category.id === service.categoryId) || null;
    }
    return result;
  };

  const buildAppointmentResult = (appointment, include) => {
    const result = clone(appointment);

    if (include && include.preferredHairdresser) {
      result.preferredHairdresser = state.users.find((user) => user.id === appointment.preferredHairdresserId) || null;
    }
    if (include && include.serviceCategory) {
      result.serviceCategory = state.categories.find((category) => category.id === appointment.serviceCategoryId) || null;
    }
    if (include && include.serviceType) {
      result.serviceType = state.services.find((service) => service.id === appointment.serviceTypeId) || null;
    }
    if (include && include.user) {
      result.user = state.users.find((user) => user.id === appointment.userId) || null;
    }
    if (include && include.drinks) {
      result.drinks = (appointment.drinkIds || [])
        .map((drinkId) => state.drinks.find((drink) => drink.id === drinkId))
        .filter(Boolean);
    }

    return result;
  };

  const prisma = {
    __state: state,
    __reset: () => {
      state.users = [];
      state.tokens = [];
      state.categories = [];
      state.services = [];
      state.appointments = [];
      state.drinks = [];
      state.tokenId = 1;
    },
    user: {
      findFirst: jest.fn(async ({ where } = {}) => {
        const found = state.users.find((user) => matchesWhere(user, where));
        return found ? clone(found) : null;
      }),
      findUnique: jest.fn(async ({ where } = {}) => {
        const [field] = Object.keys(where || {});
        const found = state.users.find((user) => user[field] === where[field]);
        return found ? clone(found) : null;
      }),
      findMany: jest.fn(async ({ where = {}, orderBy = {}, skip = 0, take = state.users.length } = {}) => {
        const filtered = state.users.filter((user) => matchesWhere(user, where));
        return clone(withPagination(applyOrderBy(filtered, orderBy), skip, take));
      }),
      count: jest.fn(async ({ where = {} } = {}) => state.users.filter((user) => matchesWhere(user, where)).length),
      create: jest.fn(async ({ data }) => {
        const user = {
          id: mockRandomUUID(),
          role: 'barber',
          isEmailVerified: false,
          emailNotificationsEnabled: true,
          pushNotificationsEnabled: true,
          subscriptionStatus: 'pending',
          accessCount: 0,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.users.push(user);
        return clone(user);
      }),
      update: jest.fn(async ({ where, data }) => {
        const user = state.users.find((entry) => entry.id === where.id);
        if (!user) {
          return null;
        }

        const payload = { ...data };
        if (payload.accessCount && typeof payload.accessCount.increment === 'number') {
          user.accessCount = (user.accessCount || 0) + payload.accessCount.increment;
          delete payload.accessCount;
        }

        Object.assign(user, payload, { updatedAt: new Date().toISOString() });
        return clone(user);
      }),
      delete: jest.fn(async ({ where }) => {
        const index = state.users.findIndex((entry) => entry.id === where.id);
        if (index < 0) {
          return null;
        }
        const [removed] = state.users.splice(index, 1);
        return clone(removed);
      }),
    },
    token: {
      create: jest.fn(async ({ data }) => {
        const token = {
          id: state.tokenId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        };
        state.tokenId += 1;
        state.tokens.push(token);
        return clone(token);
      }),
      findFirst: jest.fn(async ({ where = {} } = {}) => {
        const found = state.tokens.find((token) => matchesWhere(token, where));
        return found ? clone(found) : null;
      }),
      delete: jest.fn(async ({ where }) => {
        const index = state.tokens.findIndex((token) => token.id === where.id);
        if (index < 0) {
          return null;
        }
        const [removed] = state.tokens.splice(index, 1);
        return clone(removed);
      }),
      deleteMany: jest.fn(async ({ where = {} } = {}) => {
        const before = state.tokens.length;
        state.tokens = state.tokens.filter((token) => !matchesWhere(token, where));
        return { count: before - state.tokens.length };
      }),
    },
    serviceCategory: {
      create: jest.fn(async ({ data }) => {
        const category = {
          id: mockRandomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.categories.push(category);
        return clone(category);
      }),
      findMany: jest.fn(async ({ where = {}, orderBy = {}, skip = 0, take = state.categories.length } = {}) => {
        const filtered = state.categories.filter((category) => matchesWhere(category, where));
        return clone(withPagination(applyOrderBy(filtered, orderBy), skip, take));
      }),
      count: jest.fn(
        async ({ where = {} } = {}) => state.categories.filter((category) => matchesWhere(category, where)).length
      ),
      findFirst: jest.fn(async ({ where = {} } = {}) => {
        const found = state.categories.find((category) => matchesWhere(category, where));
        return found ? clone(found) : null;
      }),
      findUnique: jest.fn(async ({ where } = {}) => {
        const [field] = Object.keys(where || {});
        const found = state.categories.find((category) => category[field] === where[field]);
        return found ? clone(found) : null;
      }),
      update: jest.fn(async ({ where, data }) => {
        const category = state.categories.find((entry) => entry.id === where.id);
        if (!category) {
          return null;
        }
        Object.assign(category, data, { updatedAt: new Date().toISOString() });
        return clone(category);
      }),
      delete: jest.fn(async ({ where }) => {
        const index = state.categories.findIndex((entry) => entry.id === where.id);
        if (index < 0) {
          return null;
        }
        const [removed] = state.categories.splice(index, 1);
        return clone(removed);
      }),
    },
    service: {
      create: jest.fn(async ({ data }) => {
        const categoryId =
          data.categoryId || (data.category && data.category.connect ? data.category.connect.id : undefined);
        const service = {
          id: mockRandomUUID(),
          title: data.title,
          description: data.description,
          price: data.price,
          durationMinutes: data.durationMinutes || 30,
          categoryId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.services.push(service);
        return clone(service);
      }),
      findFirst: jest.fn(async ({ where = {} } = {}) => {
        const found = state.services.find((service) => matchesWhere(service, where));
        return found ? clone(found) : null;
      }),
      findMany: jest.fn(async ({ where = {}, orderBy = {}, skip = 0, take = state.services.length, include } = {}) => {
        const filtered = state.services.filter((service) => matchesWhere(service, where));
        const ordered = applyOrderBy(filtered, orderBy);
        return clone(withPagination(ordered, skip, take).map((service) => buildServiceResult(service, include)));
      }),
      count: jest.fn(async ({ where = {} } = {}) => state.services.filter((service) => matchesWhere(service, where)).length),
      findUnique: jest.fn(async ({ where, include, select } = {}) => {
        const [field] = Object.keys(where || {});
        const found = state.services.find((service) => service[field] === where[field]);
        if (!found) {
          return null;
        }

        if (select) {
          const selected = {};
          Object.keys(select).forEach((key) => {
            if (select[key]) {
              selected[key] = found[key];
            }
          });
          return clone(selected);
        }

        return clone(buildServiceResult(found, include));
      }),
      update: jest.fn(async ({ where, data }) => {
        const service = state.services.find((entry) => entry.id === where.id);
        if (!service) {
          return null;
        }
        Object.assign(service, data, { updatedAt: new Date().toISOString() });
        return clone(service);
      }),
      delete: jest.fn(async ({ where }) => {
        const index = state.services.findIndex((entry) => entry.id === where.id);
        if (index < 0) {
          return null;
        }
        const [removed] = state.services.splice(index, 1);
        return clone(removed);
      }),
    },
    appointment: {
      create: jest.fn(async ({ data }) => {
        const appointment = {
          id: mockRandomUUID(),
          status: 'Upcoming',
          ...data,
          drinkIds: data.drinks && data.drinks.connect ? data.drinks.connect.map((item) => item.id) : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        delete appointment.drinks;
        state.appointments.push(appointment);
        return clone(appointment);
      }),
      findFirst: jest.fn(async ({ where = {} } = {}) => {
        const found = state.appointments.find((appointment) => matchesWhere(appointment, where));
        return found ? clone(found) : null;
      }),
      findMany: jest.fn(async ({ where = {}, orderBy = {}, skip = 0, take = state.appointments.length, include } = {}) => {
        const filtered = state.appointments.filter((appointment) => matchesWhere(appointment, where));
        const ordered = applyOrderBy(filtered, orderBy);
        return clone(withPagination(ordered, skip, take).map((appointment) => buildAppointmentResult(appointment, include)));
      }),
      count: jest.fn(async ({ where = {} } = {}) => {
        return state.appointments.filter((appointment) => matchesWhere(appointment, where)).length;
      }),
      findUnique: jest.fn(async ({ where, include } = {}) => {
        const [field] = Object.keys(where || {});
        const found = state.appointments.find((appointment) => appointment[field] === where[field]);
        if (!found) {
          return null;
        }
        return clone(buildAppointmentResult(found, include));
      }),
      update: jest.fn(async ({ where, data }) => {
        const appointment = state.appointments.find((entry) => entry.id === where.id);
        if (!appointment) {
          return null;
        }

        const payload = { ...data };
        if (payload.drinks && payload.drinks.set) {
          appointment.drinkIds = payload.drinks.set.map((item) => item.id);
          delete payload.drinks;
        }

        Object.assign(appointment, payload, { updatedAt: new Date().toISOString() });
        return clone(appointment);
      }),
      delete: jest.fn(async ({ where }) => {
        const index = state.appointments.findIndex((entry) => entry.id === where.id);
        if (index < 0) {
          return null;
        }
        const [removed] = state.appointments.splice(index, 1);
        return clone(removed);
      }),
    },
  };

  return prisma;
});

const app = require('../../src/app');
const prisma = require('../../src/client');

const registerPayload = (overrides = {}) => ({
  firstName: 'John',
  lastName: 'Tester',
  email: `user-${mockRandomUUID()}@barberpro.com`,
  contactNumber: '11999999999',
  password: 'Password123',
  role: 'barber',
  ...overrides,
});

const registerAndLogin = async (userInput = {}) => {
  const payload = registerPayload(userInput);

  const registerRes = await request(app).post('/v1/auth/register').send(payload).expect(httpStatus.CREATED);
  const loginRes = await request(app)
    .post('/v1/auth/login')
    .send({ email: payload.email, password: payload.password })
    .expect(httpStatus.OK);

  return {
    registeredUser: registerRes.body.user,
    user: loginRes.body.user,
    tokens: loginRes.body.tokens,
    credentials: payload,
  };
};

describe('E2E - auth and appointments', () => {
  beforeEach(() => {
    prisma.__reset();
  });

  test('register, login and logout main flow with refresh token invalidation', async () => {
    const auth = await registerAndLogin({ role: 'admin' });

    expect(auth.user.email).toBe(auth.credentials.email);
    expect(auth.tokens).toHaveProperty('access.token');
    expect(auth.tokens).toHaveProperty('refresh.token');

    await request(app)
      .post('/v1/auth/logout')
      .send({ refreshToken: auth.tokens.refresh.token })
      .expect(httpStatus.NO_CONTENT);

    const secondLogout = await request(app)
      .post('/v1/auth/logout')
      .send({ refreshToken: `invalid-${auth.tokens.refresh.token}` })
      .expect(httpStatus.NOT_FOUND);

    expect(secondLogout.body).toMatchObject({
      code: httpStatus.NOT_FOUND,
      message: 'Token de sessão não encontrado',
    });
  });

  test('returns unauthorized for wrong password during login', async () => {
    const payload = registerPayload();
    await request(app).post('/v1/auth/register').send(payload).expect(httpStatus.CREATED);

    const res = await request(app)
      .post('/v1/auth/login')
      .send({ email: payload.email, password: 'WrongPass123' })
      .expect(httpStatus.UNAUTHORIZED);

    expect(res.body).toMatchObject({
      code: httpStatus.UNAUTHORIZED,
      message: 'E-mail ou senha inválidos',
    });
  });

  test('creates, lists and pays appointment using login token and legacy-compatible fields', async () => {
    const adminAuth = await registerAndLogin({
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Owner',
      contactNumber: '11988887777',
    });
    const barberAuth = await registerAndLogin({
      role: 'barber',
      firstName: 'Barber',
      lastName: 'Pro',
      contactNumber: '11977776666',
    });

    const createCategoryRes = await request(app)
      .post('/v1/service-categories')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .send({ name: 'Cabelo' })
      .expect(httpStatus.CREATED);

    const categoryId = createCategoryRes.body.id;

    const createServiceRes = await request(app)
      .post('/v1/services')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .send({
        title: 'Corte Degrade',
        description: 'Corte e acabamento',
        price: 55,
        categoryId,
      })
      .expect(httpStatus.CREATED);

    const serviceId = createServiceRes.body.id;

    const appointmentDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const createAppointmentRes = await request(app)
      .post('/v1/appointments')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .send({
        preferredHairdresser: barberAuth.user.id,
        serviceType: serviceId,
        datetimeStart: appointmentDate,
        additionalNotes: 'Cliente pontual',
      })
      .expect(httpStatus.CREATED);

    expect(createAppointmentRes.body).toMatchObject({
      preferredHairdresserId: barberAuth.user.id,
      serviceTypeId: serviceId,
      serviceCategoryId: categoryId,
      userId: adminAuth.user.id,
    });

    const appointmentId = createAppointmentRes.body.id;

    const listRes = await request(app)
      .get('/v1/appointments')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .query({
        preferredHairdresser: barberAuth.user.id,
        serviceType: serviceId,
        populate: 'preferredHairdresser,serviceType',
      })
      .expect(httpStatus.OK);

    expect(listRes.body.totalResults).toBe(1);
    expect(listRes.body.results[0]).toMatchObject({
      id: appointmentId,
      preferredHairdresserId: barberAuth.user.id,
    });
    expect(listRes.body.results[0]).toHaveProperty('preferredHairdresser.id', barberAuth.user.id);
    expect(listRes.body.results[0]).toHaveProperty('serviceType.id', serviceId);

    const payRes = await request(app)
      .post(`/v1/appointments/${appointmentId}/pay`)
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .expect(httpStatus.OK);

    expect(payRes.body).toMatchObject({
      id: appointmentId,
      paymentStatus: 'Paid',
    });
  });

  test('creates public appointment without authentication', async () => {
    const adminAuth = await registerAndLogin({ role: 'admin' });
    const barberAuth = await registerAndLogin({ role: 'barber' });

    const createCategoryRes = await request(app)
      .post('/v1/service-categories')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .send({ name: 'Barba' })
      .expect(httpStatus.CREATED);

    const createServiceRes = await request(app)
      .post('/v1/services')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .send({
        title: 'Barba completa',
        description: 'Modelagem e toalha quente',
        price: 40,
        categoryId: createCategoryRes.body.id,
      })
      .expect(httpStatus.CREATED);

    const appointmentDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const response = await request(app)
      .post('/v1/appointments/public')
      .send({
        barberId: barberAuth.user.id,
        serviceId: createServiceRes.body.id,
        datetimeStart: appointmentDate,
        guestName: 'Cliente Visitante',
        guestPhone: '11995554444',
      })
      .expect(httpStatus.CREATED);

    expect(response.body).toMatchObject({
      preferredHairdresserId: barberAuth.user.id,
      serviceTypeId: createServiceRes.body.id,
      status: 'Upcoming',
    });
    expect(response.body.userId).toBeTruthy();
  });

  test('creates public appointment using service name fallback when serviceId is absent', async () => {
    const barberAuth = await registerAndLogin({ role: 'barber' });

    const appointmentDate = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    const response = await request(app)
      .post('/v1/appointments/public')
      .send({
        barberId: barberAuth.user.id,
        serviceName: 'Galope no meu colo',
        servicePrice: 30,
        serviceDurationMinutes: 45,
        datetimeStart: appointmentDate,
        guestName: 'Ryan',
        guestPhone: '71987796154',
        email: '',
      })
      .expect(httpStatus.CREATED);

    expect(response.body).toMatchObject({
      preferredHairdresserId: barberAuth.user.id,
      serviceCategoryId: expect.any(String),
      serviceTypeId: expect.any(String),
      status: 'Upcoming',
    });
  });

  test('blocks barber with pending subscription from appointments route', async () => {
    const barberAuth = await registerAndLogin({ role: 'barber' });

    const res = await request(app)
      .get('/v1/appointments')
      .set('Authorization', `Bearer ${barberAuth.tokens.access.token}`)
      .expect(httpStatus.PAYMENT_REQUIRED);

    expect(res.body.message).toContain('Pagamento pendente');
  });

  test('returns 401 when creating appointment without token', async () => {
    const res = await request(app).post('/v1/appointments').send({}).expect(httpStatus.UNAUTHORIZED);

    expect(res.body).toMatchObject({
      code: httpStatus.UNAUTHORIZED,
      message: 'Faça login para continuar',
    });
  });

  test('returns 400 when appointment id is invalid UUID on pay endpoint', async () => {
    const adminAuth = await registerAndLogin({ role: 'admin' });

    const res = await request(app)
      .post('/v1/appointments/not-a-uuid/pay')
      .set('Authorization', `Bearer ${adminAuth.tokens.access.token}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(res.body).toMatchObject({
      code: httpStatus.BAD_REQUEST,
    });
    expect(res.body.message).toContain('must be a valid UUID');
  });
});
