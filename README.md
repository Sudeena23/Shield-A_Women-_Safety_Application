# Shield – Women Safety & Emergency Companion Application 🛡️

**Shield** is a full-stack personal safety and emergency response web application engineered to protect women and vulnerable individuals with 1-touch SOS alerts, live GPS tracking, trusted guardian networks, discreet fake calls, and an administrative safety control center.

---

## 🌟 Key Features

### 1. 🚨 Emergency 1-Touch SOS Dispatch
- Instantly trigger an emergency broadcast to your entire trusted guardian network.
- Automatically shares your live GPS latitude, longitude, and street address with high accuracy.
- Sound siren alert and notify guardians and admin dispatch instantly.

### 2. 👨‍👩‍👧 Trusted Guardian Network
- Add, edit, and manage trusted emergency contacts (Mother, Father, Partner, Friends, Safety Officers).
- Mark a **Primary Guardian** who receives priority notifications and phone call routing during distress.
- Test alerts feature to verify in-app notification delivery.

### 3. 📡 Real-Time Live Location Broadcast
- Continuous, encrypted GPS breadcrumb trail during late-night commutes or transit.
- One-click copy and share of Google Maps live tracking links with friends or family.

### 4. 📞 Discreet Fake Call Generator
- Realistic incoming call simulator with customizable caller name ("Dad", "Police Dispatch", "Boss") and ring timer delay.
- Enables safe, graceful exits from uncomfortable or suspicious situations.

### 5. 🛡️ Admin Control Center
- Centralized user and alert monitoring dashboard.
- Live emergency log feeds, status updates (*Active*, *Unit Dispatched*, *Resolved*), and account management.

---

## 🏗️ System Architecture

```
Shield/
├── backend/                  # Node.js + Express + MongoDB + Socket.io Server
│   ├── config/               # Database connection (Mongoose)
│   ├── middleware/           # JWT Auth & Admin authorization middlewares
│   ├── models/               # User, Guardian, Alert, Location, AuditLog models
│   ├── routes/               # API endpoints (/auth, /guardians, /alerts, /admin, /location)
│   ├── seed.js               # Database seeder with sample data
│   └── index.js              # Express app & Socket.io server entry point
│
├── frontend/                 # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Footer, Modals, Cards)
│   │   ├── pages/            # App pages (Home, Auth, Dashboard, Guardians, LiveLocation, UserProfile, UserSettings)
│   │   ├── services/         # Axios API services (authService, guardianService, alertService, etc.)
│   │   ├── App.jsx           # Main router and global application state
│   │   └── main.jsx          # Root React entry point
│   ├── package.json
│   └── vite.config.js
│
└── package.json              # Root scripts to run both Frontend and Backend
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on `mongodb://localhost:27017` or MongoDB Atlas URI in `backend/.env`)

### 1. Install Dependencies
In the root directory, or individually in `frontend/` and `backend/`:
```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
DB_URL=mongodb://localhost:27017/shield
JWT_SECRET=ShieldSafetyApp_2026_SecureKey_9xK2mP7q
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed the Database (Optional)
Populate the database with initial users and guardians:
```bash
node backend/seed.js
```

### 4. Run the Application

**Run Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
# or: node index.js
```

**Run Frontend Client (Port 3000):**
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:3000` to start using Shield.

---

## 🔐 Default Test Credentials (from Seed)

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Standard User** | `user@shield.com` | `user123` | Regular user with dashboard, guardians, live GPS tracking |
| **System Admin** | `admin@shield.com` | `admin123` | Full administrative control center and alert dispatch |

---

## 📱 User Workflow Guide

1. **Create Account / Login:**
   - Navigate to `/auth`. Switch between **Login** and **Create Account**.
   - Fill in your basic details (Name, Email, Mobile Phone) and safety profile (Password, Blood Group).
2. **Setup Guardians:**
   - Go to **My Guardians** (`/guardians`) and add trusted contacts with their phone numbers.
   - Set a **Primary Guardian** for priority notifications.
3. **Trigger SOS in Emergency:**
   - Press the prominent red/caramel **SOS Button** anywhere in the app to broadcast your GPS coordinates to guardians and helplines.
   - Click **Cancel SOS / Disarm Alert** once you are in a safe environment.
4. **Use Discreet Fake Call:**
   - Tap **Fake Call** in the navigation bar to trigger a timed incoming call simulator with customizable caller name.

---

## 🛡️ License
ISC License © Shield Safety Team. Built with care for women's safety & peace of mind.
