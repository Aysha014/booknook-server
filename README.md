# BookNook – Backend API

This repository contains the backend REST API for BookNook, an online library management system.

The backend is built with Express.js and MongoDB. It provides endpoints for managing books, borrowing books, retrieving borrowing records, and returning books.

## Live API

**Backend URL:** https://booknook-server-three-zeta.vercel.app

## Technologies Used

- Node.js
- Express.js
- MongoDB
- MongoDB Node.js Driver
- JavaScript
- CORS
- dotenv
- Vercel

## Key Features

1. **Book Management:** Create, retrieve, update, and delete books.
2. **Book Details:** Retrieve individual book information by ID.
3. **Borrowing System:** Allow users to borrow available books.
4. **Borrowing Records:** Retrieve borrowing records for a specific user.
5. **Return System:** Return borrowed books and restore available copies.
6. **Availability Tracking:** Automatically decrease available copies when a book is borrowed and increase them when returned.
7. **Duplicate Borrow Prevention:** Prevent a user from borrowing the same book again while an active borrowing record exists.
8. **Input Validation:** Validate MongoDB ObjectIds and required request fields.

## API Endpoints

Base URL:

```text
https://booknook-server-three-zeta.vercel.app
```

### Book APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get a single book |
| POST | `/books` | Add a new book |
| PATCH | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

### Borrow APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/borrows` | Borrow a book |
| GET | `/borrows?userEmail=email` | Get user's borrowed books |
| DELETE | `/borrows/:id` | Return a borrowed book |

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd booknook-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

### 4. Start the Development Server

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:8000
```

## Database

BookNook uses MongoDB as its database.

Database name:

```text
booknook
```

Collections:

- `books` – Stores book information.
- `borrows` – Stores borrowing records.

## Frontend Integration

The backend provides REST API endpoints consumed by the BookNook Next.js frontend.

CORS is configured to allow requests from the frontend application and the local development environment.

## Deployment

The backend is deployed on Vercel.

**Live API:** https://booknook-server-three-zeta.vercel.app

## Author

Developed as part of the BookNook full-stack library management project.
