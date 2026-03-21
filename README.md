# BizzBuzz

BizzBuzz is a full-stack e-commerce web application with user authentication, product management, cart and checkout flow, reviews, and complaint handling.

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express
- Database: MySQL (`mysql2`)

## Project Structure

- `backend/` - Express API, controllers, routes, SQL schema
- `frontend/BizzBuzz/` - React client app

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

1. Create the database schema:
	- Run `backend/db.sql`
2. Configure backend database connection in `backend/db.js`:
	- `host`, `user`, `password`, `database`

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend default URL: `http://localhost:3080`

### Frontend

```bash
cd frontend/BizzBuzz
npm install
npm run dev
```

Frontend runs on Vite default URL (usually `http://localhost:5173`).

## Available Scripts

- Backend: `npm start`, `npm run dev`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`