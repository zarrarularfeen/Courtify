# 🏟️ Courtify — Local Setup Guide

A complete guide to running the Courtify project on your laptop from scratch.

---

## Prerequisites — Install These First

| Tool | Purpose | Download |
|---|---|---|
| **Node.js (LTS)** | Runs the backend & frontend | [nodejs.org](https://nodejs.org) |
| **MySQL Workbench** | Manage the MySQL database visually | [mysql.com/downloads/workbench](https://dev.mysql.com/downloads/workbench/) |
| **MySQL Server** | The actual database engine | Bundled with MySQL Workbench installer |
| **Postman** *(optional)* | Test backend API endpoints | [postman.com/downloads](https://www.postman.com/downloads/) |

> [!IMPORTANT]
> During MySQL installation, you will be asked to set a **root password** — remember it, you'll need it later.

---

## Step 1 — Set Up the MySQL Database

### 1.1 Open MySQL Workbench
Launch MySQL Workbench and connect to your local MySQL instance (usually `localhost:3306` with user `root`).

### 1.2 Create the Database
In the top menu, click **File → New Query Tab**, paste this, then click ⚡ **Execute**:

```sql
CREATE DATABASE courtify_db;
USE courtify_db;
```

### 1.3 Import the Schema
1. In MySQL Workbench, go to **File → Open SQL Script**
2. Navigate to:
   ```
   Courtify/backend/sql/courtify_db.sql
   ```
3. Click ⚡ **Execute** — this creates all tables and inserts the dummy data.

### ✅ Verify
In the left panel under **Schemas**, you should see `courtify_db` with tables like `players`, `arenas`, `bookings`, etc.

---

## Step 2 — Configure Backend Environment Variables

The backend reads secrets from a `.env` file. You need to create one.

### 2.1 Create the `.env` file
Inside the `Courtify/backend/` folder, create a new file named exactly **`.env`** (no extension).

### 2.2 Paste this content and fill in your values:

```env
# ── Database ──────────────────────────────
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=courtify_db

# ── Server URLs ───────────────────────────
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# ── Email (for signup verification) ───────
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> [!NOTE]
> **`EMAIL_PASS` is NOT your Gmail login password.** You need a Gmail **App Password**:
> 1. Go to your Google Account → **Security**
> 2. Enable **2-Step Verification** (if not already on)
> 3. Search for **"App passwords"**
> 4. Create one for "Mail" → copy the 16-character code → paste it as `EMAIL_PASS`

> [!TIP]
> If you don't want to set up email right now (e.g., just testing locally), you can skip the email fields — signup will still work but the verification email won't send. You can manually set `is_active = 1` in the database for test users.

---

## Step 3 — Install Backend Dependencies & Run

Open a terminal (PowerShell or CMD) and run:

```powershell
# Navigate to the backend folder
cd "c:\Users\TECHNOSELLERS\Shaheer Personal\HU\Sem 6\Software Eng\Project\Courtify\backend"

# Install all dependencies
npm install

# Start the backend server
node server.js
```

### ✅ Verify
You should see:
```
✅ Connected to MySQL database
🚀 Server running on port 5000
```

If you see a MySQL connection error, double-check your `.env` credentials.

---

## Step 4 — Install Frontend Dependencies & Run

Open a **second terminal** (keep backend running in the first), and run:

```powershell
# Navigate to the frontend folder
cd "c:\Users\TECHNOSELLERS\Shaheer Personal\HU\Sem 6\Software Eng\Project\Courtify\frontend"

# Install all dependencies
npm install

# Start the React dev server
npm run dev
```

### ✅ Verify
You should see:
```
  VITE v8.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173** — the Courtify app should load.

---

## Step 5 — Test with Dummy Accounts

The database comes with pre-seeded test accounts (password is `12345678` for all):

| Role | Email | Password |
|---|---|---|
| **Player** | `player@example.com` | `12345678` |
| **Arena Owner** | `marksman_admin@example.com` | `12345678` |
| **Arena Owner** | `titan_admin@example.com` | `12345678` |

---

## Step 6 — (Optional) Test APIs with Postman

If you want to test or modify backend functionality:

1. Open Postman
2. The backend runs at **`http://localhost:5000`**

### Key Endpoints

| Method | URL | Body / Params |
|---|---|---|
| `GET` | `/auth/validate?email=...&password=...&userType=player` | Query params |
| `POST` | `/auth/signup` | JSON body: `{email, password, name, phone, userType}` |
| `GET` | `/arenas` | — |
| `GET` | `/arena/1` | — |
| `POST` | `/bookings` | JSON body: `{userId, courtId, date, startTime, endTime}` |
| `GET` | `/bookings/1` | — |
| `GET` | `/owner/arenas?ownerId=1` | Query param |

---

## Quick Summary — Both Servers Running

```
Terminal 1 (Backend):   node server.js          → http://localhost:5000
Terminal 2 (Frontend):  npm run dev             → http://localhost:5173
MySQL:                  Running via MySQL Workbench on port 3306
```

> [!WARNING]
> Always start the **backend first**, then the frontend. The frontend makes API calls to `localhost:5000` on page load.
