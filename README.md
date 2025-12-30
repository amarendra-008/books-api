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

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Books (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books with author info |
| GET | `/api/books/my` | Get current user's books |
| GET | `/api/books/:id` | Get a single book |
| POST | `/api/books` | Create a new book |
| PUT | `/api/books/:id` | Update a book (owner only) |
| DELETE | `/api/books/:id` | Delete a book (owner only) |

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/books-api.git
   cd books-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create environment file
   ```bash
   cp .env.example .env
   ```

4. Start PostgreSQL with Docker
   ```bash
   docker-compose up -d
   ```

5. Run the server
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/books` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table
```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INTEGER,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## License

MIT
