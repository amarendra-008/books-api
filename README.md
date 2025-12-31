# Books API

![CI](https://github.com/amarendra-008/books-api/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-ready RESTful API for managing books, built with Node.js, Express, TypeScript, and PostgreSQL. Features JWT authentication, comprehensive testing, and CI/CD pipeline.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js 5 |
| Database | PostgreSQL 16 |
| Auth | JWT + bcrypt |
| Validation | validator.js |
| Security | Helmet + Rate Limiting |
| Logging | Morgan |
| Docs | Swagger/OpenAPI |
| Testing | Jest + Supertest |
| CI/CD | GitHub Actions |
| Code Quality | ESLint |

## Features

- **Authentication** - JWT-based auth with secure password hashing (bcrypt)
- **Authorization** - Resource ownership (users can only modify their own books)
- **Security** - Helmet headers, rate limiting, input validation
- **API Documentation** - Interactive Swagger UI at `/api-docs`
- **Testing** - Unit tests with Jest and Supertest
- **CI/CD** - Automated testing and builds with GitHub Actions
- **Health Check** - `/health` endpoint for monitoring
- **Logging** - Request logging with Morgan

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/amarendra-008/books-api.git
cd books-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (optional - defaults work for development)
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Create Database Tables

Connect to PostgreSQL and run:

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

### 5. Start Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`
API Docs at `http://localhost:3000/api-docs`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/books` | Yes | Get all books |
| GET | `/api/books/my` | Yes | Get user's books |
| GET | `/api/books/:id` | Yes | Get book by ID |
| POST | `/api/books` | Yes | Create book |
| PUT | `/api/books/:id` | Yes | Update book (owner only) |
| DELETE | `/api/books/:id` | Yes | Delete book (owner only) |

## Usage Examples

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "Password123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "Password123"}'
```

### Create Book

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "1984", "author": "George Orwell", "year": 1949}'
```

## Scripts

```bash
npm run dev        # Development with hot reload
npm run build      # Build TypeScript
npm start          # Production
npm run lint       # Run ESLint
npm run lint:fix   # Fix lint issues
npm test           # Run tests
npm run test:watch # Watch mode
```

## Project Structure

```
books-api/
├── .github/workflows/   # CI/CD
├── src/
│   ├── config/          # Configuration
│   ├── db/              # Database connection
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   ├── tests/           # Test files
│   └── index.ts         # Entry point
├── db/                  # SQL schemas
├── .env.example         # Environment template
├── docker-compose.yml   # PostgreSQL
├── jest.config.js       # Test config
└── tsconfig.json        # TypeScript config
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | booksdb | Database name |
| DB_USER | postgres | Database user |
| DB_PASSWORD | postgres | Database password |
| JWT_SECRET | (random) | JWT signing key |

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## License

MIT
