# BizzBuzz — Full-Stack E-Commerce Platform

A complete e-commerce solution with authentication, product management, shopping cart & checkout, customer reviews, and complaint handling — all in one cohesive platform.

> **Full-Stack Web Application**
---

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Secure user registration and login |
| **Product Management** | Browse, search, and manage product listings |
| **Cart & Checkout** | Full shopping cart flow with order placement |
| **Reviews** | Customers can rate and review products |
| **Complaint Handling** | Built-in support ticket and complaint system |

---

## Architecture

```
bizzbuzz/
├── backend/                # Express REST API
│   ├── controllers/        # Route handler logic
│   ├── routes/             # API route definitions
│   ├── db.js               # MySQL connection config
│   └── db.sql              # Database schema
└── frontend/
    └── BizzBuzz/           # React client application
        ├── src/
        │   ├── pages/      # Route-level page components
        │   ├── components/ # Reusable UI components
        │   └── api/        # Axios request helpers
        └── vite.config.ts
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | MySQL 8+ (`mysql2`) |

---

## Quick Start

**Prerequisites:** Node.js 18+, MySQL 8+

### 1. Database Setup

```bash
# Run the schema against your MySQL instance
mysql -u <user> -p < backend/db.sql
```

### 2. Backend Configuration

Update `backend/db.js` with your database credentials:

```js
const pool = mysql.createPool({
  host:     'localhost',
  user:     '<your_user>',
  password: '<your_password>',
  database: 'bizzbuzz',
});
```

### 3. Run the App

```bash
# Backend  →  http://localhost:3080
cd backend
npm install
npm run dev

# Frontend  →  http://localhost:5173
cd frontend/BizzBuzz
npm install
npm run dev
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and get session |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get a single product |
| `POST` | `/api/cart` | Add item to cart |
| `POST` | `/api/orders` | Place an order |
| `POST` | `/api/reviews` | Submit a product review |
| `POST` | `/api/complaints` | File a complaint |

---

## License

Academic / personal project. Feel free to fork and build on it.
