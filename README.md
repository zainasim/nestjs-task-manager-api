# Backend Assignment API

A NestJS-based REST API for authentication, invitation management, and task management with role-based access control.

## Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## API Architecture Decision

This project uses **REST API with Swagger documentation** instead of GraphQL. Here's why:

1. **Simplicity & Clarity**: REST APIs are more straightforward for CRUD operations and easier to understand
2. **Better Documentation**: Swagger provides excellent interactive documentation out of the box, making API exploration and testing easier
3. **Standard HTTP Methods**: REST follows standard HTTP conventions (GET, POST, PATCH, DELETE) which are intuitive
4. **Pagination & Filtering**: REST APIs handle offset-based and cursor-based pagination more naturally with query parameters

```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and configure:
   - Database connection details
   - JWT secret key
   - Admin user credentials (for seeder)

4. **Create PostgreSQL database**:
   ```sql
   CREATE DATABASE assignment_db;
   ```

5. **Run database migrations** (TypeORM will auto-sync in development):
   The application uses TypeORM's `synchronize` option in development mode, which automatically creates/updates tables. For production, you should use migrations.

6. **Seed the admin user**:
   ```bash
   npm run seed:admin
   ```
   
   This creates the first admin user with:
   - Email: `admin@example.com` (or from `ADMIN_EMAIL` env var)
   - Password: `admin123` (or from `ADMIN_PASSWORD` env var)

7. **Start the development server**:
   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`
   Swagger documentation will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /auth/login` - Login user
- `POST /auth/signup` - Sign up new user (requires invite token)

### Invitations (Admin Only)

- `POST /invitations` - Create a new invitation
- `GET /invitations` - Get all invitations
- `PATCH /invitations/:id/resend` - Resend an invitation

### Tasks

- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks (paginated, with filters)
- `GET /tasks/:id` - Get a task by ID
- `PATCH /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Features

### 1. Authentication & Authorization

- **Login**: Users can log in with email and password
- **Signup**: Invite-only signup (requires valid invitation token)
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Admin and Client roles with different permissions

### 2. Invitation System

- **Invite Creation**: Admins can create invitations for new users
- **Token Expiration**: Invitations expire after 48 hours
- **Resend Invitation**: Resending resets the expiration date
- **Console Logging**: Invitation tokens are logged to console (no mailer integration)

### 3. Tasks Management

- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **User Association**: Tasks are linked to users
- **Status Management**: Tasks can be Pending or Completed
- **Access Control**:
  - Clients can only view/manage their own tasks
  - Admins can view/manage all tasks

### 4. Pagination

- **Offset-based Pagination**: Traditional page/limit approach
  - Query params: `page`, `limit`
- **Cursor-based Pagination**: More efficient for large datasets
  - Query params: `cursor`, `limit`
  - Returns `nextCursor` for next page

### 5. Filtering

- **Status Filter**: Filter tasks by status (pending/completed)
- **User Filter**: Admins can filter tasks by user ID



## Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run seed:admin` - Seed the admin user
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

```

## Testing

The Swagger UI at `http://localhost:3000/api` provides an interactive interface to test all endpoints. You can:

1. Authenticate and get a JWT token
2. Use the "Authorize" button to add the token
3. Test all endpoints directly from the browser

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Invitation tokens expire after 48 hours
- Role-based access control enforced at route level
- Input validation on all endpoints

## Notes
To send invitation, first signIn as admin and use this token to send invitation to user and use generated token to signup

