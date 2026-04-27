# User Registration App

A full-stack user registration project built to demonstrate how a real web application connects a frontend, backend API, database, GitHub, and deployment platform.

**Stack:** Next.js · FastAPI · PostgreSQL · Vercel · Railway

---

## How It All Connects

```
Browser (Next.js)
      |
      | HTTP POST /api/register
      v
FastAPI Backend
      |
      | SQLAlchemy ORM
      v
PostgreSQL Database
```

1. User fills in the registration form in the browser
2. Next.js sends a POST request to the FastAPI backend
3. FastAPI validates the data, hashes the password, and saves the user to PostgreSQL
4. The frontend shows a success or error message

---

## Project Structure

```
user-registration-app/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Registration page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── registration-form.tsx   # Form with loading + error states
│   ├── .env.local.example     # Environment variable template
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/                   # FastAPI app
│   ├── main.py                # API routes and app setup
│   ├── database.py            # Database connection
│   ├── models.py              # SQLAlchemy User model
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variable template
│
└── .gitignore
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL running locally (or a free cloud database — see below)

---

### 1. Set up the database

Create a PostgreSQL database called `registration_db`:

```bash
psql -U postgres
CREATE DATABASE registration_db;
\q
```

---

### 2. Start the backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL, e.g.:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/registration_db

# Start the server
uvicorn main:app --reload
```

The API will be running at **http://localhost:8000**

Visit http://localhost:8000/docs to see the interactive API documentation.

---

### 3. Start the frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000  (already set)

# Start the dev server
npm run dev
```

The frontend will be running at **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/register` | Register a new user |

### POST /api/register

**Request body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Success response (201):**
```json
{
  "id": 1,
  "full_name": "Jane Smith",
  "email": "jane@example.com"
}
```

**Error response (400):**
```json
{
  "detail": "An account with this email already exists."
}
```

---

## Database Schema

```sql
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR NOT NULL,
  email          VARCHAR UNIQUE NOT NULL,
  hashed_password VARCHAR NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

Passwords are hashed with **bcrypt** via passlib. The plain-text password is never stored.

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Connect the repo in Vercel
3. Set the root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app`
5. Deploy

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a PostgreSQL database — Railway gives you the `DATABASE_URL` automatically
3. Deploy the `backend/` folder
4. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` (from the Railway PostgreSQL service)
6. Update the CORS origin in `main.py` to your Vercel frontend URL

---

## What You Learn

- How a frontend and backend communicate over HTTP
- How FastAPI handles request validation with Pydantic
- How SQLAlchemy maps Python classes to database tables
- Why passwords must be hashed before storing
- How environment variables keep secrets out of your code
- How to deploy a full-stack app across two platforms

---

Built by [Collins Obasuyi](https://collinsobasuyi.com)
