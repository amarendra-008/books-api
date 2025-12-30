# Books API

RESTful Books API with Express, PostgreSQL, JWT authentication, and user ownership.

## Tech Stack

- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL (Docker)
- **Authentication:** JWT + bcrypt
- **Validation:** Email format & password strength

## Features

- User registration and login with secure password hashing
- JWT-based authentication
- Full CRUD operations for books
- User ownership - users can only modify their own books
- PostgreSQL with connection pooling

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/amarendra-008/books-api.git
cd books-api
npm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Create Database Tables

Connect to PostgreSQL (pgAdmin/DBeaver/TablePlus):

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `booksdb` |
| Username | `postgres` |
| Password | `postgres` |

Run these SQL commands:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INTEGER,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 4. Start Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/books` | Yes | Get all books with owner info |
| GET | `/api/books/my` | Yes | Get current user's books |
| GET | `/api/books/:id` | Yes | Get book by id |
| POST | `/api/books` | Yes | Create new book |
| PUT | `/api/books/:id` | Yes | Update book (owner only) |
| DELETE | `/api/books/:id` | Yes | Delete book (owner only) |

---

## Test with cURL

### Authentication

#### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "created_at": "2024-12-30T10:00:00.000Z"
  }
}
```

#### Login and get token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  }
}
```

> **Save the token!** You'll need it for all protected routes.

---

### Books (Protected Routes)

> Replace `YOUR_TOKEN` with the token from login response.

#### Create a book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "year": 1949
  }'
```

**Response:**
```json
{
  "message": "Book added successfully",
  "book": {
    "id": 1,
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "user_id": 1,
    "created_at": "2024-12-30T10:00:00.000Z",
    "updated_at": "2024-12-30T10:00:00.000Z"
  }
}
```

#### Get all books (with owner info)

```bash
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "created_at": "2024-12-30T10:00:00.000Z",
    "updated_at": "2024-12-30T10:00:00.000Z",
    "owner_id": 1,
    "owner_username": "john"
  }
]
```

#### Get my books only

```bash
curl http://localhost:3000/api/books/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get book by ID

```bash
curl http://localhost:3000/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a book (owner only)

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Animal Farm",
    "author": "George Orwell",
    "year": 1945
  }'
```

#### Delete a book (owner only)

```bash
curl -X DELETE http://localhost:3000/api/books/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Error Responses

#### Missing token (401)

```bash
curl http://localhost:3000/api/books
```

```json
{ "message": "No token provided" }
```

#### Invalid token (401)

```bash
curl http://localhost:3000/api/books \
  -H "Authorization: Bearer invalid_token"
```

```json
{ "message": "Invalid token" }
```

#### Not owner (403)

```bash
curl -X DELETE http://localhost:3000/api/books/1 \
  -H "Authorization: Bearer ANOTHER_USERS_TOKEN"
```

```json
{ "message": "Not authorized to delete this book" }
```

#### Book not found (404)

```bash
curl http://localhost:3000/api/books/999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```json
{ "message": "Book not found" }
```

#### Invalid input (400)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "invalid-email",
    "password": "weak"
  }'
```

```json
{ "message": "Invalid email format" }
```

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## Project Structure

```
books-api/
├── src/
│   ├── index.ts           # App entry point
│   ├── db/
│   │   └── index.ts       # Database connection pool
│   ├── middleware/
│   │   └── auth.ts        # JWT auth middleware
│   └── routes/
│       ├── auth.ts        # Register & login routes
│       └── books.ts       # Books CRUD routes
├── db/
│   ├── users.sql          # Users table schema
│   └── books.sql          # Books table schema
├── docker-compose.yml     # PostgreSQL container
├── package.json
└── tsconfig.json
```

---

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Check running containers
docker ps

# View logs
docker-compose logs -f

# Stop PostgreSQL
docker-compose down

# Stop and delete data
docker-compose down -v
```

---

## NPM Scripts

```bash
# Development (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm start
```

---

## HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input, missing fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not owner of resource |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/username |
| 500 | Server Error | Database or server failure |

---

## License

MIT