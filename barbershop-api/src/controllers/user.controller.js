const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { sanitizeUser, sanitizePaginatedResults } = require('../utils/sanitizeResponse');

const SELF_UPDATE_RESTRICTED_FIELDS = ['role', 'selectedUserId'];

const assertSelfUpdatePayloadIsAllowed = (payload) => {
  const attemptedRestrictedFields = SELF_UPDATE_RESTRICTED_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(payload, field)
  );

  if (attemptedRestrictedFields.length > 0) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Nao e permitido alterar campos privilegiados da propria conta');
  }
};

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(sanitizeUser(user));
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['email', 'role', 'firstName', 'lastName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(sanitizePaginatedResults(result, sanitizeUser));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (req.user.role !== 'admin' && req.user.id !== req.params.userId && user.role !== 'barber') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  res.send(sanitizeUser(user));
});

const getBarbers = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers({ role: 'barber' }, options);
  res.send(sanitizePaginatedResults(result, sanitizeUser));
});

const changePassword = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (req.user.id !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Acesso negado');
  }

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect current password');
  }

  await userService.updateUserById(userId, { password: newPassword });

  res.status(httpStatus.OK).send({ message: 'Password changed successfully' });
});

const updateUser = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const isSelfUpdate = req.user.id === req.params.userId;

  if (!isAdmin && !isSelfUpdate) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Acesso negado');
  }

  if (!isAdmin) {
    assertSelfUpdatePayloadIsAllowed(req.body);
  }
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(sanitizeUser(user));
});

const deleteUser = catchAsync(async (req, res) => {
  if (req.user && req.user.role !== 'admin' && req.user.id !== req.params.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Você não tem permissão para deletar este perfil');
  }

  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getBarbers,
  changePassword,
  updateUser,
  deleteUser,
};
