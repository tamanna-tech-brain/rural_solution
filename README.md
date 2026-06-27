# 🌾 KrishiPool — Rural Agri-Coordination Platform

> A modern SaaS platform connecting Indian farmers for **equipment rental**, **mandi transport pooling**, **payments**, **dispute resolution**, and **real-time GPS tracking**.

---

## 🚀 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 19 + Vite + Tailwind CSS + Framer Motion |
| State     | Redux Toolkit |
| Backend   | Node.js + Express 5 + MongoDB + Mongoose |
| Auth      | JWT + OTP Email Verification |
| Storage   | Cloudinary (images) |
| Maps      | React-Leaflet + OpenStreetMap |
| Charts    | Recharts |
| Deployment| Docker + Nginx + PM2 |

---

## 📦 Project Structure

```
rural_solution/
├── Backend/
│   ├── config/          # DB, Cloudinary config
│   ├── controllers/     # Auth, Equipment, Booking, Mandi, Payment, Dispute, Admin
│   ├── middleware/      # Auth, Admin, Upload, ErrorHandler
│   ├── models/          # User, Equipment, Booking, MandiPool, Payment, Dispute, Notification, HelpPost
│   ├── routes/          # All API routes
│   ├── services/        # Business logic services
│   ├── app.js           # Express app setup
│   ├── server.js        # Server entry point
│   ├── Dockerfile
│   ├── ecosystem.config.js  # PM2 config
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API layer
│   │   ├── components/  # Sidebar, Navbar, ErrorBoundary, Skeletons, ConfirmDialog
│   │   ├── context/     # DarkModeContext
│   │   ├── hooks/       # useAuth, useToast, useDebounce
│   │   ├── layout/      # AppLayout
│   │   ├── pages/       # All pages
│   │   ├── redux/       # Store, Slices
│   │   └── routes/      # AppRoutes
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
└── docker-compose.yml
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm / pnpm

### 1. Backend

```bash
cd Backend

# Copy env file
cp .env.example .env
# → Edit .env with your MongoDB URI, JWT secret, Cloudinary keys, SMTP credentials

npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

# Copy env file
cp .env.example .env
# → Set VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

Services:
- `http://localhost:80` — Frontend
- `http://localhost:5000` — Backend API
- `http://localhost:5000/api/health` — Health check

---

## 🚀 Production with PM2

```bash
cd Backend
cp .env.example .env
# Edit .env for production

npm install --only=production
npx pm2 start ecosystem.config.js --env production
npx pm2 save
npx pm2 startup
```

---

## 🔑 API Endpoints

| Method | Endpoint                       | Auth | Description |
|--------|-------------------------------|------|-------------|
| POST   | /api/auth/register             | —    | Register + send OTP |
| POST   | /api/auth/login                | —    | Login + send OTP |
| POST   | /api/auth/verify-email         | —    | Verify OTP → JWT |
| GET    | /api/equipment                 | —    | List all equipment |
| POST   | /api/equipment                 | ✅   | Add equipment |
| GET    | /api/bookings                  | ✅   | List bookings |
| POST   | /api/bookings                  | ✅   | Create booking |
| GET    | /api/mandi                     | —    | List mandi pools |
| POST   | /api/mandi/:id/join            | ✅   | Join a mandi pool |
| GET    | /api/admin/stats               | 🛡️   | Dashboard stats (admin) |
| GET    | /api/health                    | —    | Health check |

---

## ✅ Key Improvements Made

### Security Fixes
- ✅ JWT-based ownership checks (not req.body user ID)
- ✅ Rate limiting (global + auth-specific)
- ✅ Helmet security headers
- ✅ Removed API credentials from console logs
- ✅ Auto-logout on 401 (token expiry)

### Bug Fixes
- ✅ Redux Provider missing from main.jsx
- ✅ Wrong Redux slice filenames
- ✅ `/booking` route crash without params
- ✅ `req.user._id` vs `req.user.id` inconsistency
- ✅ GPS interval memory leak in MandiPage
- ✅ Duplicate navbar in Dashboard
- ✅ Express 5 wildcard route syntax

### New Features
- ✅ Admin panel with charts and user management
- ✅ Profile page with trust score
- ✅ Dark mode with localStorage persistence
- ✅ Toast notifications (replaced all alert() calls)
- ✅ Confirm dialogs (replaced all confirm() calls)
- ✅ Skeleton loading on all pages
- ✅ Join Mandi Pool API endpoint
- ✅ 404 Not Found page
- ✅ Code splitting with React.lazy + Suspense
- ✅ Docker + Nginx + PM2 deployment configs

---

## 🌐 Languages Supported

Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu, Odia, Assamese, Nepali, English

---

## 📝 License

MIT
