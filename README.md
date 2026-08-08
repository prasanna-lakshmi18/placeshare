# PlaceShare — Placement Experience Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zerops](https://img.shields.io/badge/Deployed_on-Zerops-00E599?style=for-the-badge)](https://zerops.io)

> A modern, high-performance web platform designed for university students to share, discover, and discuss real-world interview questions, preparation tips, and placement experiences.

---

## 🌟 Key Features

- 🎯 **Experience Feed & Filters**: Search and filter placement reviews by company name, role, difficulty rating, and selection outcome.
- 💬 **Instagram-Style Nested Commenting**: Self-referential comment threads with infinite recursive replies, built on an $O(1)$ single-query flat loading + $O(n)$ in-memory tree builder to prevent $N+1$ database bottlenecks.
- ⚡ **Optimistic UI Updates**: Immediate client feedback on likes and comments powered by TanStack Query (React Query).
- 📜 **Cursor-Based Pagination**: Resilient, high-performance feed pagination that stays fast with thousands of posts.
- 🎓 **Student Verification**: Email verification flow with custom token lifecycle and verified badges.
- 🌓 **Dynamic Dark / Light Mode**: Integrated Tailwind theming with system preference sync.
- 👤 **Interactive User Profiles**: Dedicated profile hubs showcasing authored posts, comments, liked posts, and verification status.

---

## 🏗️ Architecture & System Design

```mermaid
graph TD
    Client[React + TypeScript SPA] -->|REST API / JSON| Gateway[FastAPI Backend Server]
    Client -->|Static Assets| Nginx[Nginx / Static CDN]
    Gateway -->|ORM / Migrations| Postgres[(PostgreSQL / SQLite)]
    Gateway -->|Async Tasks| SMTP[Google SMTP / Mail Gateway]
    Gateway -->|TTL Cache| Cache[In-Memory Cache]
```

### Comment System Architecture
Instead of recursive SQL queries that trigger exponential database requests, PlaceShare uses a **flat-load & tree-build algorithm**:
1. All comments for an experience are fetched in a single indexed query (`SELECT * FROM comments WHERE experience_id = :id ORDER BY created_at ASC`).
2. The backend constructs a nested hierarchy in memory in $O(n)$ time using an adjacency dictionary.
3. The React frontend recursively renders the tree using `<CommentItem />`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite + TypeScript
- **Data Fetching & State**: TanStack Query v5 (React Query)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS + Lucide Icons + `date-fns`

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ORM & Migrations**: SQLAlchemy 2.0 + Alembic
- **Validation**: Pydantic v2
- **Auth**: JWT (Stateless Bearer & HTTP-only Cookies) with Argon2/Bcrypt password hashing
- **Mailing**: Asynchronous SMTP Client with TLS/SSL support

---

## 📁 Repository Structure

```text
placeshare/
├── .github/workflows/         # CI / CD automation pipelines
├── backend/                   # FastAPI application
│   ├── alembic/               # Database schema migrations
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── routers/           # REST API route handlers
│   │   ├── schemas/           # Pydantic data validation schemas
│   │   ├── services/          # Business logic & caching
│   │   └── utils/             # Security, email & pagination utilities
│   ├── tests/                 # Pytest test suite
│   ├── Dockerfile             # Backend container image
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React Vite SPA
│   ├── src/
│   │   ├── api/               # Axios API client & interceptors
│   │   ├── components/        # UI components (Feed, Comments, Profiles)
│   │   ├── context/           # Auth & Theme state contexts
│   │   └── hooks/             # Custom React Query mutation hooks
│   ├── Dockerfile             # Multi-stage production Nginx build
│   └── package.json           # Frontend dependencies
├── docker-compose.yml         # Local full-stack orchestration
└── zerops.yaml                # Production deployment configuration
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

Run the entire stack with a single command:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Configure the following variables in your environment or deployment platform (e.g. Zerops):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or SQLite database connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT signing key | `your-secure-random-jwt-secret` |
| `FRONTEND_URL` | Base URL of the live frontend | `https://frontend-2a96.prg1.zerops.app` |
| `SMTP_HOST` | Outgoing SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (`587` for STARTTLS, `465` for SSL) | `587` |
| `SMTP_USER` | SMTP username / sender address | `placeshareaits@gmail.com` |
| `SMTP_PASSWORD` | SMTP password or Google App Password | `your-16-char-app-password` |
| `MAIL_FROM` | Visible sender address in emails | `placeshareaits@gmail.com` |

---

## 🧪 Testing

Run backend tests using `pytest`:

```bash
cd backend
pytest -v
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
