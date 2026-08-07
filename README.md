# PlaceShare — Placement Experience Platform

A high-performance full-stack web application designed for university students to share, discover, and discuss placement and interview experiences.

## 🚀 Features

*   **Experience Feed:** Browse through interview experiences shared by peers with infinite scrolling and filtering options.
*   **Instagram-style Nested Comments:** Engage in deep discussions with a recursive, infinitely nested comment thread system.
*   **Optimistic UI:** Instantaneous feedback when liking posts or adding comments for a seamless user experience.
*   **Rich Profiles:** User authentication with JWT-based secure HTTP-only cookies.
*   **Dark/Light Mode:** First-class support for theming.
*   **Cursor-based Pagination:** Efficient data loading for feeds that scale to thousands of entries.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 19 (via Vite) + TypeScript
*   **State Management:** TanStack Query (React Query) for server state and optimistic updates
*   **Styling:** Vanilla CSS (with modern variables and dark mode support) + Tailwind CSS (configured)
*   **Icons:** Lucide React

### Backend
*   **Framework:** FastAPI (Python)
*   **Database:** SQLite (Local Dev) / PostgreSQL (Production ready)
*   **ORM:** SQLAlchemy 2.0 with Alembic for migrations
*   **Validation:** Pydantic v2
*   **Auth:** JWT (JSON Web Tokens) with secure HTTP-only cookies and bcrypt password hashing
*   **Caching:** In-memory TTL cache for hot data (extensible to Redis)

## 🏗️ Architecture

The backend utilizes a **flat-load + tree-build strategy** for the nested comment system. Instead of suffering from the N+1 query problem commonly associated with recursive data structures, the FastAPI backend fetches all comments for a given experience in a single O(1) query and reconstructs the tree in memory (O(n) time complexity) before returning it to the React frontend. 

The frontend uses a recursive component (`CommentItem`) to render this tree natively, supporting infinite visual nesting levels.

## 💻 Getting Started (Local Development)

Follow these steps to run the application locally.

### Prerequisites
*   Python 3.12+
*   Node.js 20+

### 1. Backend Setup

Open a terminal in the `backend` directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (starts on http://localhost:8000)
uvicorn app.main:app --reload
```
*Note: The SQLite database (`placement.db`) will be created automatically on the first run.*
*API Documentation (Swagger UI) will be available at `http://localhost:8000/docs`.*

### 2. Frontend Setup

Open a new terminal in the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server (starts on http://localhost:5173)
npm run dev
```

The frontend proxy is already configured in `vite.config.ts` to forward API requests from `/api` to the FastAPI backend running on port 8000.

## 📝 Next Steps
- Implement frontend UI styling for the newly created components (`index.css` needs to be fleshed out with the specific class names used).
- Set up Docker and `docker-compose.yml` for containerized production deployment.
