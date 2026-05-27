# Krisipool

> A collaborative mandi/booking platform (Backend: Node/Express, Frontend: React + Vite)

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Notes](#api-notes)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## Project Overview

Krisipool is a full-stack application for managing mandi listings, equipment bookings, payments, notifications and user management. The repository contains a Node.js/Express backend and a React (Vite) frontend.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React, Vite, TailwindCSS
- Auth: JWT
- Real-time: socket-based modules (sockets/)
- Payments: Razorpay dependency present (integrations may be in services)

## Features

- User registration, email verification and authentication
- Equipment listings and booking flows
- Payments, disputes and notifications
- Translation utilities and location clustering/helpers

## Getting Started

Follow these quick steps to run the project locally.

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB instance (local or hosted)

### Backend Setup

1. Change into the backend folder and install dependencies:

```bash
cd Backend
npm install
```

2. Create a `.env` file (see `Backend/.env.example`) and set the required variables.

3. Start the dev server:

```bash
npm run dev
```

The backend listens on `process.env.PORT` (defaults to `3000`).

### Frontend Setup

1. Change into the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

The frontend dev server default origin is `http://localhost:5173` (CORS is configured in the backend).

## Environment Variables

Create `Backend/.env` from `Backend/.env.example`. Relevant variables used in the backend include:

- `MONGO_URI` — MongoDB connection string
- `PORT` — Backend server port
- `JWT_SECRET` — Secret key for signing JWTs
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` — SMTP config (optional; uses nodemailer test account if not provided in development)
- `MAIL_FROM` — Optional from address for outgoing emails
- `NODE_ENV` — `development` or `production`

There is also a Cloudinary config file present at `Backend/config/cloudinary.js` (currently empty). Add Cloudinary envs there if you plan to use image uploads.

## Running Locally

Recommended separate terminals:

Backend:

```bash
cd Backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open the app at `http://localhost:5173`.

## Project Structure (high level)

- `Backend/` — Express server, routes, controllers, models, services, sockets
- `frontend/` — React + Vite app, components, pages, API helpers

See the folders in the repo for more details.

## API Notes

- Backend exposes routes mounted under `/api/*` (see `Backend/app.js`):
  - `/api/auth` — auth and verification endpoints
  - `/api/users` — user CRUD and profile
  - `/api/equipment` — equipment listing endpoints
  - `/api/bookings` — booking flow
  - `/api/mandi` — mandi/marketplace endpoints
  - `/api/payments` — payment endpoints
  - `/api/disputes` — dispute management
  - `/api/notifications` — notifications
  - `/api/translate` — translation helpers

Authentication is JWT-based — include `Authorization: Bearer <token>` for protected routes.

## Contributing

- Create an issue for the feature or bug you'd like to address.
- Fork and make a branch: `git checkout -b feat/your-feature`
- Run linters and tests (if present) before opening a PR.

## License & Contact

This repo does not include an explicit license file. Add a `LICENSE` if you intend to make the project open-source.

If you'd like me to expand this README (add API examples, Postman collection, `.env` generation, or frontend README), tell me which parts to prioritize.
