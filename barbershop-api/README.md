# Barbershop API

[![Build Status](https://travis-ci.org/hagopj13/node-express-boilerplate.svg?branch=master)](https://travis-ci.org/hagopj13/node-express-boilerplate)
[![Coverage Status](https://coveralls.io/repos/github/hagopj13/node-express-boilerplate/badge.svg?branch=master)](https://coveralls.io/github/hagopj13/node-express-boilerplate?branch=master)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

The Barbershop API provides the backend services for managing appointments, reviews, barbers, and user profiles for a hairdressing salon. Built with Node.js, Express, and MongoDB, this API powers the Barbershop appointment management system.

## Features

- **CRUD Operations**: Manage users, barbers, appointments, and reviews.
- **Authentication and Authorization**: Secure routes with JWT tokens.
- **Validation**: Robust request validation with Joi.
- **Error Handling**: Centralized error management.
- **API Documentation**: Interactive Swagger UI.
- **Role-based Access Control**: Admin and user roles with permissions.
- **Pagination**: Efficient data retrieval with Mongoose pagination.
- **Health Check Endpoint**: Monitor API status.

## Table of Contents

- [Barbershop API](#barbershop-api)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Commands](#commands)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [API Documentation](#api-documentation)
    - [API Endpoints](#api-endpoints)
  - [Error Handling](#error-handling)
  - [Validation](#validation)
  - [Authentication \& Authorization](#authentication--authorization)
  - [Logging](#logging)
  - [Custom Mongoose Plugins](#custom-mongoose-plugins)
  - [Contributing](#contributing)
  - [License](#license)

## Getting Started

### Prerequisites

- Node.js >= 12.0.0
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/stekatag/barbershop-api.git
   cd barbershop-api
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:
   `bash cp .env.example .env` Modify `.env` with your settings.

4. Start the development server:
   ```bash
   yarn dev
   ```

## Commands

- **Running locally**: `yarn dev`
- **Running in production**: `yarn start`
- **Testing**: `yarn test`
- **Docker**: `yarn docker:dev` (development), `yarn docker:prod` (production)
- **Linting**: `yarn lint` or `yarn lint:fix`
- **Coverage**: `yarn coverage`

## Environment Variables

Configure your environment variables in the `.env` file:

```bash
# Server configuration

PORT=3000

# Database

MONGODB_URL=mongodb://127.0.0.1:27017/barbershop-api

# JWT

JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Email service

SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=no-reply@barbershop.com

# For more .env variables, check the .env.example file
```

## Project Structure

```
src\
|--config\ # Environment variables and configurations
|--controllers\ # Route controllers
|--docs\ # Swagger files
|--middlewares\ # Custom express middlewares
|--models\ # Mongoose models
|--routes\ # Routes
|--services\ # Business logic
|--utils\ # Utility classes and functions
|--validations\ # Request data validation schemas
|--app.js # Express app
|--index.js # App entry point
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

**Auth routes**:

- `POST /v1/auth/register` - Register
- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh-tokens` - Refresh auth tokens
- `POST /v1/auth/forgot-password` - Send reset password email
- `POST /v1/auth/reset-password` - Reset password
- `POST /v1/auth/send-verification-email` - Send verification email
- `POST /v1/auth/verify-email` - Verify email

**User routes**:

- `POST /v1/users` - Create a user
- `GET /v1/users` - Get all users
- `GET /v1/users/:userId` - Get a user
- `PATCH /v1/users/:userId` - Update a user
- `PATCH /v1/users/:userId/password` - Change user password
- `DELETE /v1/users/:userId` - Delete a user

**Barber routes**:

- `GET /v1/barbers` - Get all barbers
- `GET /v1/barbers/:barberId` - Get a barber by ID
- `PATCH /v1/barbers/:barberId/assign` - Assign a barber
- `PATCH /v1/barbers/:barberId/unassign` - Unassign a barber

**Appointment routes**:

- `POST /v1/appointments` - Create an appointment
- `GET /v1/appointments` - Get all appointments
- `GET /v1/appointments/:appointmentId` - Get an appointment
- `PATCH /v1/appointments/:appointmentId` - Update an appointment
- `DELETE /v1/appointments/:appointmentId` - Delete an appointment

**Review routes**:

- `POST /v1/reviews` - Create a review
- `GET /v1/reviews` - Get all reviews
- `GET /v1/reviews/:reviewId` - Get a review
- `PATCH /v1/reviews/:reviewId` - Update a review
- `DELETE /v1/reviews/:reviewId` - Delete a review

**Service routes**:

- `POST /v1/services` - Create a service
- `GET /v1/services` - Get all services
- `GET /v1/services/:serviceId` - Get a service by ID
- `PATCH /v1/services/:serviceId` - Update a service
- `DELETE /v1/services/:serviceId` - Delete a service

**Service Category routes**:

- `POST /v1/service-categories` - Create a service category
- `GET /v1/service-categories` - Get all service categories
- `GET /v1/service-categories/:categoryId` - Get a service category by ID
- `PATCH /v1/service-categories/:categoryId` - Update a service category
- `DELETE /v1/service-categories/:categoryId` - Delete a service category

**Health check route**:

- `GET /v1/health` - Check API health status

## Error Handling

The API uses centralized error handling. Errors are captured and returned in a consistent format. In development, stack traces are included.

```json
{
  "code": 404,
  "message": "Not found"
}
```

## Validation

The API uses Joi for request validation. Validation schemas are defined in the `src/validations` directory and are used in conjunction with the `validate` middleware.

## Authentication & Authorization

Authentication is handled using JWT tokens. Secure routes by adding the `auth` middleware. For role-based access control, the middleware can accept permissions.

```javascript
router.patch('/users/:userId', auth('manageUsers'), userController.updateUser);
```

## Logging

The API uses Winston for logging, with different levels (error, warn, info) logged depending on the environment. HTTP request logs are managed by Morgan.

## Custom Mongoose Plugins

The project includes custom Mongoose plugins for transforming JSON responses and implementing pagination. These are added to the schemas in the `src/models` directory.

## Contributing

Contributions are welcome! Please refer to the [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)
