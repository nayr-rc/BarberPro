const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const prisma = require('../client');
const ApiError = require('../utils/ApiError');
const { notifySubscriptionEvent } = require('../utils/notifications');

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {string} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email, excludeUserId) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      id: { not: excludeUserId },
    },
  });
  return !!user;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Object>}
 */
const createUser = async (userBody) => {
  if (await isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Handle JSON fields for SQLite
  const data = { ...userBody };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 8);
  }
  if (data.pushSubscription && typeof data.pushSubscription === 'object') {
    data.pushSubscription = JSON.stringify(data.pushSubscription);
  }
  if (data.workingHours && typeof data.workingHours === 'object') {
    data.workingHours = JSON.stringify(data.workingHours);
  }

  if (data.role === 'barber') {
    data.subscriptionStatus = 'pending';
  }

  const user = await prisma.user.create({
    data,
  });

  // Notifica o administrador (Ryan) sobre a nova tentativa de contratação
  if (user.role === 'barber') {
    void notifySubscriptionEvent({
      event: 'user.created',
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userId: user.id,
      subscriptionStatus: user.subscriptionStatus
    });
  }

  return user;
};

/**
 * Query for users
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const queryUsers = async (filter, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  // Basic sort parsing "field:asc"
  let orderBy = {};
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    orderBy[field] = order || 'asc';
  }

  const users = await prisma.user.findMany({
    where: filter,
    take: limit,
    skip,
    orderBy,
  });

  const totalResults = await prisma.user.count({ where: filter });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: users,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get user by id
 * @param {string} id
 * @param {Object} [requester]
 * @returns {Promise<Object>}
 */
const getUserById = async (id, requester = null) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // If requester is provided, check permissions
  if (requester) {
    // If the user is a barber, allow public access
    if (user.role === 'barber') {
      return user;
    }
    // If the requester is not an admin or the user themselves, restrict access
    if (requester.role !== 'admin' && user.id !== requester.id) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }
  }

  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<Object>}
 */
const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const data = { ...updateBody };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 8);
  }
  // Handle JSON fields for SQLite
  if (data.pushSubscription && typeof data.pushSubscription === 'object') {
    data.pushSubscription = JSON.stringify(data.pushSubscription);
  }
  if (data.workingHours && typeof data.workingHours === 'object') {
    data.workingHours = JSON.stringify(data.workingHours);
  }

  // Handle role change to barber
  if (data.role === 'barber') {
    data.selectedUserId = userId;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return updatedUser;
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<Object>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  await prisma.user.delete({
    where: { id: userId },
  });
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
