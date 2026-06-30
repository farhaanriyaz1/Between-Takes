# 🎬 Between Takes — Movie Explorer

**Between Takes** is a full-stack movie discovery web application that lets users explore trending films, search for movies and actors, view aggregated ratings from multiple sources, and engage with the community through comments. Built with React (Vite) on the frontend and dual Express.js backends — one for authentication and one for comments.

---

## ✨ Features

### 🎥 Movie Discovery
- **Trending Movies** — Real-time trending movies powered by the TMDB API, displayed in an animated card grid
- **Movie Search** — Search for any movie by title with instant results
- **Actor Search** — Toggle between movie and actor search modes to find your favourite performers
- **Skeleton Loading** — Smooth skeleton placeholders while content loads

### 🎬 Movie Details
- **Cinematic Detail Pages** — Full-screen backdrop images, poster art, genre pills, runtime, release year, and director info
- **Aggregated Ratings** — View ratings from **TMDB**, **IMDb**, and **Rotten Tomatoes** side by side, plus a custom **"Between Takes Score"** that averages all three
- **Top Cast** — Browse the top 8 cast members with profile photos and character names, each linking to their full actor profile

### 🎭 Actor Profiles
- **Detailed Actor Pages** — Profile photo, biography with expand/collapse, birth details, age calculation, place of birth
- **Filmography Grid** — Complete filmography sorted by popularity, showing poster, rating, character name, and release year
- **Stats Dashboard** — Total movie count and popularity score at a glance

### 💬 Comments System
- **Movie Comments** — Users can leave comments on any movie's detail page
- **Guest or Authenticated** — Post as a guest (with a display name) or as a signed-in user
- **Comment Ownership** — Signed-in users can delete their own comments
- **Resilient Backend** — Falls back to in-memory storage if MongoDB is unavailable

### 🔐 Authentication
- **Sign Up** — Create an account with username, email, and password (bcrypt-hashed)
- **Sign In** — Authenticate with email and password, receive a JWT token
- **Session Persistence** — JWT stored in localStorage; sessions survive page reloads
- **Protected UI** — Navbar shows avatar + username when logged in, with a sign-out button

### 🎨 Design & UX
- **Dark Cinematic Theme** — Deep navy/purple backgrounds with vibrant pink-to-purple gradients
- **Glassmorphism** — Frosted-glass card effects throughout the UI
- **Micro-Animations** — Staggered card entrance animations, hover effects, loading spinners
- **Google Fonts** — Uses Inter and Outfit for modern, premium typography
- **Fully Responsive** — Adapts seamlessly to mobile, tablet, and desktop viewports

---

## 🏗️ Architecture Overview

```
between-takes/
├── public/                       # Static assets (favicon, icons)
├── src/                          # React frontend (Vite)
│   ├── components/               # Reusable UI components
│   │   └── MovieCard.jsx         # Movie poster card with rating badge
│   ├── context/
│   │   └── AuthContext.jsx       # React Context for auth state management
│   ├── pages/
│   │   ├── Home.jsx              # Landing page (trending + search)
│   │   ├── MovieDetails.jsx      # Movie detail page with ratings & comments
│   │   ├── ActorDetails.jsx      # Actor profile & filmography page
│   │   └── AuthPage.jsx          # Sign In / Sign Up page
│   ├── services/
│   │   ├── api.js                # TMDB & OMDb API integrations
│   │   ├── auth.js               # Auth API client (signup, signin, getMe)
│   │   └── comments.js           # Comments API client with fallback URLs
│   ├── App.jsx                   # Root component with routes
│   ├── App.css                   # All application styles
│   ├── index.css                 # Global/reset styles
│   └── main.jsx                  # Vite entry point
├── server/                       # Auth Backend (Express + SQLite)
│   ├── index.js                  # Express server entry (port 3001)
│   ├── db.js                     # SQLite database setup & schema
│   ├── routes/
│   │   └── auth.js               # Auth routes (signup, signin, me)
│   └── middleware/
│       └── auth.js               # JWT verification middleware
├── between-takes-backend/        # Comments Backend (Express + MongoDB)
│   ├── server.js                 # Express server entry (port 5001)
│   ├── models/
│   │   └── Comment.js            # Mongoose Comment schema
│   ├── controllers/
│   │   └── commentsController.js # CRUD logic with in-memory fallback
│   └── routes/
│       └── comments.js           # Comment REST routes
├── .env                          # Frontend environment variables
├── index.html                    # HTML entry point with meta tags & fonts
├── vite.config.js                # Vite build configuration
└── package.json                  # Frontend dependencies & scripts
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks (useState, useEffect, useContext) |
| **Vite 8** | Lightning-fast dev server and build tool |
| **React Router v7** | Client-side routing with nested routes |
| **Vanilla CSS** | Custom styles with CSS variables, animations, and glassmorphism |
| **Google Fonts** | Inter & Outfit typefaces |

### Auth Backend (`server/`)
| Technology | Purpose |
|---|---|
| **Express.js 4** | REST API framework |
| **better-sqlite3** | Embedded SQLite database (zero-config, file-based) |
| **bcryptjs** | Password hashing with salt rounds |
| **jsonwebtoken** | JWT token generation & verification |
| **cors** | Cross-origin request handling |

### Comments Backend (`between-takes-backend/`)
| Technology | Purpose |
|---|---|
| **Express.js 5** | REST API framework |
| **Mongoose 9** | MongoDB ODM for comment storage |
| **MongoDB** | NoSQL database for comments (with in-memory fallback) |
| **dotenv** | Environment variable management |

### External APIs
| API | Purpose |
|---|---|
| **TMDB API** | Trending movies, movie search, movie details, credits, actor search, actor details, filmography |
| **OMDb API** | IMDb rating, Rotten Tomatoes rating, Metascore |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (optional — comments fall back to in-memory storage if unavailable)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/between-takes.git
cd between-takes
```

### 2. Install Dependencies

You need to install dependencies for three separate packages:

```bash
# Frontend
npm install

# Auth backend
cd server
npm install
cd ..

# Comments backend
cd between-takes-backend
npm install
cd ..
```

### 3. Configure Environment Variables

#### Frontend (`.env` in project root)

```env
VITE_TMDB_TOKEN=your_tmdb_bearer_token
VITE_OMDB_API_KEY=your_omdb_api_key
VITE_COMMENTS_API_BASE=http://localhost:5001/api/comments
```

- Get your TMDB token at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Get your OMDb key at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)

#### Comments Backend (`between-takes-backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/between-takes
PORT=5001
```

> **Note:** If MongoDB is not running, the comments backend will automatically use in-memory storage. Comments will persist as long as the server is running.

### 4. Start All Services

Open three terminal windows:

**Terminal 1 — Frontend (Vite dev server)**
```bash
npm run dev
```
Runs on `http://localhost:5173`

**Terminal 2 — Auth Backend**
```bash
cd server
node index.js
```
Runs on `http://localhost:3001`

**Terminal 3 — Comments Backend**
```bash
cd between-takes-backend
npm start
```
Runs on `http://localhost:5001`

---

## 📡 API Reference

### Auth API (`localhost:3001`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/signin` | Sign in with email & password | No |
| `GET` | `/api/auth/me` | Get current user from JWT | Yes (Bearer token) |
| `GET` | `/api/health` | Health check | No |

#### POST `/api/auth/signup`
```json
{
  "username": "cinephile",
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response (201):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "username": "cinephile", "email": "user@example.com" }
}
```

#### POST `/api/auth/signin`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response (200):**
```json
{
  "message": "Signed in successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "username": "cinephile", "email": "user@example.com" }
}
```

---

### Comments API (`localhost:5001`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/comments/:movieId` | Get all comments for a movie |
| `POST` | `/api/comments` | Create a new comment |
| `DELETE` | `/api/comments/:commentId` | Delete a comment (owner only) |
| `GET` | `/api/health` | Health check with DB status |

#### POST `/api/comments`
```json
{
  "movieId": "12345",
  "username": "cinephile",
  "text": "Amazing movie, loved every scene!"
}
```

---

## 📁 Frontend Pages & Routing

| Route | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Trending movies grid, search bar with movie/actor toggle |
| `/movie/:id` | `MovieDetails.jsx` | Full movie details, ratings dashboard, cast list, comments |
| `/actor/:id` | `ActorDetails.jsx` | Actor profile, biography, filmography grid |
| `/auth` | `AuthPage.jsx` | Sign In / Sign Up forms with tab toggle |

---

## 🔒 Authentication Flow

```
┌─────────────┐       POST /api/auth/signup        ┌──────────────┐
│  AuthPage   │ ──────────────────────────────────▶ │  Auth Server │
│  (React)    │                                     │  (Express)   │
│             │ ◀────────────────────────────────── │              │
│             │   { token, user }                   │  SQLite DB   │
└──────┬──────┘                                     └──────────────┘
       │
       │ Store token in localStorage
       │ Set user in AuthContext
       │
       ▼
┌──────────────┐
│   Home Page  │  Navbar shows avatar + username
│              │  Sign Out clears token & state
└──────────────┘
```

1. User fills out the sign-up or sign-in form on `/auth`
2. Frontend sends credentials to the Auth Backend
3. Backend hashes password (signup) or verifies it (signin), generates a JWT
4. Frontend stores the JWT in `localStorage` and sets the user in React Context
5. On page reload, `AuthContext` calls `/api/auth/me` with the stored token to restore the session
6. Signing out removes the token from `localStorage` and clears the user state

---

## 💾 Database Schemas

### Users Table (SQLite — `server/database.sqlite`)

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `username` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL (bcrypt hash) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Comments Collection (MongoDB — `between-takes` database)

| Field | Type | Constraints |
|---|---|---|
| `movieId` | String | Required, indexed, trimmed |
| `username` | String | Required, max 60 chars |
| `text` | String | Required, max 1000 chars |
| `createdAt` | Date | Auto-generated (timestamps) |
| `updatedAt` | Date | Auto-generated (timestamps) |

---

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a1a` | Main background |
| `--bg-card` | `rgba(17, 15, 36, 0.85)` | Card backgrounds |
| `--accent` | `#a78bfa` | Primary accent (violet) |
| `--accent-pink` | `#f472b6` | Gradient accent (pink) |
| `--text-primary` | `#f0eef6` | Main text |
| `--text-muted` | `#8b86a3` | Secondary text |

### Typography

- **Headings**: Outfit (600–900 weight)
- **Body**: Inter (300–500 weight)

### Key CSS Features

- **Glassmorphism**: `backdrop-filter: blur()` with semi-transparent backgrounds
- **Staggered Animations**: Cards enter with `@keyframes fadeInUp` using dynamic `animation-delay`
- **Gradient Accents**: Linear gradients from violet → pink across buttons, borders, and badges
- **Skeleton Loading**: Pulsing placeholder cards with `@keyframes shimmer`

---

## 📜 Scripts

### Frontend (`package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start Vite development server |
| `build` | `vite build` | Build production bundle to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Lint all files with ESLint |

### Auth Backend (`server/package.json`)

| Script | Command | Description |
|---|---|---|
| `start` | `node index.js` | Start the auth server |
| `dev` | `nodemon index.js` | Start with auto-reload on changes |

### Comments Backend (`between-takes-backend/package.json`)

| Script | Command | Description |
|---|---|---|
| `start` | `node server.js` | Start the comments server |
| `dev` | `nodemon server.js` | Start with auto-reload on changes |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 🎬 by <strong>Between Takes</strong>
</p>
