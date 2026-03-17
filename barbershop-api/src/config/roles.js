const allRoles = {
  barber: [],
  customer: [],
  admin: ['getUsers', 'manageUsers', 'manageServices'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
