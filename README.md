# BizzBuzz

A full-stack e-commerce platform with authentication, product management, cart & checkout, reviews, and complaint handling.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, React Router, Tailwind CSS, Axios |
| **Backend** | Node.js, Express |
| **Database** | MySQL 8+ (`mysql2`) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Database
```bash
# Run the schema file against your MySQL instance
mysql -u <user> -p < backend/db.sql
```

### 2. Backend Configuration
Update `backend/db.js` with your database credentials:
```js
host, user, password, database
```

---

## Running Locally

```bash
# Backend  →  http://localhost:3080
cd backend && npm install && npm run dev

# Frontend  →  http://localhost:5173
cd frontend/BizzBuzz && npm install && npm run dev
```

---

## Project Structure

```
bizzbuzz/
├── backend/        # Express API — controllers, routes, SQL schema
└── frontend/
    └── BizzBuzz/   # React client application
```