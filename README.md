# NextGenNote

**An AI-native notepad that thinks with you.**

NextGenNote isn't just a place to store text — it's a workspace that turns raw emotion into reflective writing, links scattered ideas into a visual graph of thought, and organizes your notes the way your brain actually works: by mood, by collection, and by connection.

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Walkthrough](#feature-walkthrough)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Core Algorithms](#core-algorithms)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Environment Variables](#environment-variables)
10. [Local Setup](#local-setup)
11. [Deployment](#deployment)
12. [Responsive Design Notes](#responsive-design-notes)
13. [Roadmap](#roadmap)

---

## Overview

NextGenNote was built from scratch as a full-stack MERN application (MongoDB, Express, React, Node.js), designed to answer one question: **what would a notepad look like if it were built in the AI era instead of the 1990s?**

The result is a note-taking app with four pillars that don't typically coexist in the same product:

- **A real, working AI co-writer** (AI Canvas) that turns a described emotion into a genuine reflective journal entry — not a gimmick, an actual Groq-powered LLM call with a carefully engineered system prompt
- **A knowledge graph** (Connecting Thoughts) that visualizes how your notes relate to each other, using a custom-built force-directed physics simulation — no external graph library
- **Organizational depth** — collections with custom colors, pinning, archiving, soft-delete trash with recovery, and full-text search — all built on top of a single flexible Note schema
- **A production-grade auth & UX layer** — JWT sessions with real expiry checking, multi-account switching on one device, dark mode, customizable greetings/avatars, and a fully responsive layout that adapts from a 4K desktop down to a 360px phone screen with a native-feeling bottom tab bar

---

## Feature Walkthrough

<img width="1894" height="902" alt="Screenshot (1661)" src="https://github.com/user-attachments/assets/5009820f-ee10-4d48-9d70-5c8ae811c4cc" />

### 1. Landing Page
The first thing a new, logged-out visitor sees. A marketing-style hero section explaining the product, a feature checklist (Free/Open Source, Graph Builder, Custom Collections, AI Mode), a "Get Started Free" CTA, and a dashboard mockup preview.

<img width="1917" height="907" alt="image" src="https://github.com/user-attachments/assets/2db2a6c8-a03f-41bf-a610-f65ed5cf2cbd" />

### 2. Authentication
Glassmorphic split-screen Login and Signup pages, each with a dark animated brand panel on the left (desktop only) and a frosted-glass form card on the right. Sessions persist for 7 days via JWT; after that, the token is detected as expired on load and the user is transparently returned to the Landing page rather than seeing a broken dashboard.

<img width="1901" height="905" alt="Screenshot 2026-07-24 135048" src="https://github.com/user-attachments/assets/9760cf20-b1d1-4500-9445-615b004f5e19" />

### 3. Dashboard
The home base. A collapsible sidebar (desktop) or bottom tab bar (mobile) for navigation between All Notes, Starred, Archive, Trash, and custom Collections. Notes render as gradient purple cards, split into **Pinned** and **Other Notes** sections, with a live search bar and a 3/4/5-column density toggle on wide screens.


### 4. Note Editor
Notes open in **view mode** by default (read-only) and only become editable after explicitly clicking **Edit** — this prevents accidental edits from a stray click. From the editor, a note can be saved, archived, linked to other notes, or assigned to a collection. New notes are drafts until the user actually writes something and saves — nothing is persisted to the database on a blank "New Note" click.

<img width="1917" height="908" alt="Screenshot 2026-07-24 135118" src="https://github.com/user-attachments/assets/4091347d-d765-4f7f-b250-b1ef57b1a710" />

### 5. AI Canvas
The signature feature. A togglable panel (side panel on desktop, full-screen sheet on mobile/tablet) where the user picks a mood chip and describes what's on their mind. That prompt is sent to a Groq-hosted Llama 3.3 70B model with a system prompt engineered to produce a warm, human-sounding reflective journal entry — not a clinical AI summary. The generated text can be saved directly as a note, tagged with the mood and an "AI Generated" badge.

### 6. Collections
User-created groupings (e.g., "DSA," "Mood," "Reading List") each with a custom accent color. Notes inside a collection render with a colored top border matching that collection. Notes can be created directly inside a collection, or added to one after the fact via an "Add existing note" picker.

<img width="1917" height="911" alt="Screenshot 2026-07-24 134952" src="https://github.com/user-attachments/assets/526056fc-9706-4d77-b90f-eba6aa236c44" />

### 7. Connecting Thoughts
An Obsidian-style knowledge graph. Every note is a node; explicit links between notes (created from inside the editor) are edges. Nodes glow more intensely the more connections they have ("hub" notes), and the whole graph is rendered as an interactive, draggable force-directed simulation built entirely in raw SVG + `requestAnimationFrame` — no D3, no graph library. Includes filters for "Strong Links" (2+ connections) and "Orphan Nodes" (zero connections), plus live stats (Total Notes, Connections, Clusters).

### 8. Notifications
A real-time-feeling activity log: "First note created!", "You pinned a note!", "You archived a note!", etc. — triggered server-side any time a relevant action occurs, with per-item delete and a "Clear all" action, respecting a user-level notification on/off toggle in Settings.

<img width="1911" height="913" alt="Screenshot 2026-07-24 135159" src="https://github.com/user-attachments/assets/013b6d12-2611-41e9-a3ee-ccc0797501b3" />
<img width="1895" height="915" alt="Screenshot 2026-07-24 135144" src="https://github.com/user-attachments/assets/5d986dd8-d7f2-4bd2-aae5-f3987dcde151" />

### 9. Settings & Profile
Dark/light mode toggle, notification toggle, a 7-avatar picker, a customizable dashboard greeting (default "Hola"), and a full Profile page with editable display name, account verification badge, and **multi-account switching** — the app remembers every account a user has logged into on that device and lets them swap between them without re-entering a password.

### 10. Mobile Experience
Below the `sm` breakpoint, the sidebar disappears entirely in favor of a bottom tab bar (Notes / AI / Alerts / More), with a slide-up sheet for secondary navigation (Starred/Archive/Trash, Workspace, Connecting Thoughts, Settings). The AI Canvas becomes a full-screen sheet through tablet widths. The Connecting Thoughts graph gets a collapsible filter drawer instead of a fixed side panel, and node-dragging supports real touch events, not just mouse.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React (Vite) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Routing | React Router v6 |
| HTTP client | Axios (with request/response interceptors) |
| Backend framework | Express.js |
| Database | MongoDB Atlas + Mongoose ODM |
| Authentication | JWT (jsonwebtoken) + bcrypt password hashing |
| AI provider | Groq API (Llama 3.3 70B Versatile) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## System Architecture

```
┌─────────────────────┐         HTTPS / JSON          ┌──────────────────────┐
│   React SPA          │ ─────────────────────────────▶│   Express API         │
│   (Vercel)            │                                │   (Render)             │
│                       │ ◀───────────────────────────── │                        │
│  - AuthContext        │      JWT in Authorization       │  - authMiddleware      │
│  - ThemeContext        │      header on every call       │    (verifies JWT)      │
│  - axios interceptors  │                                │  - Controllers         │
│    (attach token,      │                                │    (auth, note,        │
│     handle 401)        │                                │     collection, user,  │
└──────────┬───────────┘                                │     notification, ai)  │
           │                                              └──────────┬───────────┘
           │ localStorage                                            │
           │ (token, user,                                           │ Mongoose
           │  saved accounts,                                        │
           │  recent notes,                                          ▼
           │  grid density)                              ┌──────────────────────┐
           │                                              │   MongoDB Atlas        │
           │                                              │                        │
           │                                              │  Collections:          │
           │                                              │  - users               │
           │                                              │  - notes               │
           │                                              │  - collections         │
           │                                              │  - notifications       │
           │                                              └──────────────────────┘
           │
           │  external call (server-side only)
           ▼
┌──────────────────────┐
│   Groq API             │
│   (Llama 3.3 70B)       │
│   — AI Canvas note      │
│      generation          │
└──────────────────────┘
```

**Request flow for a typical authenticated action** (e.g., pinning a note):
1. User clicks "Pin" in `NoteCard` → `Dashboard.handlePin(note)` fires
2. `togglePinNote(note._id)` calls the shared `api` axios instance
3. Axios request interceptor reads `token` from `localStorage` and attaches it as `Authorization: Bearer <token>`
4. Request hits Express → `authMiddleware` verifies the JWT signature and expiry, decodes `userId`, attaches it to `req`
5. `noteController.togglePin` flips `isPinned`, saves via Mongoose, and calls `notify()` to log a notification (respecting the user's `notificationsEnabled` preference)
6. Response returns → frontend calls `refresh()`, which re-fetches notes, counts, and notifications in parallel

---

## Core Algorithms

### 1. Force-Directed Graph Layout (Connecting Thoughts)

The knowledge graph is not powered by any charting/graph library — it's a hand-rolled physics simulation running on every animation frame:

- **Repulsion**: every pair of nodes exerts an inverse-square repulsive force on each other (`force = k / distance²`), so nodes naturally spread out and never stack on top of each other
- **Spring attraction**: every edge (link between two notes) acts like a spring with a target rest-length of 150px — nodes connected by an edge are pulled toward that distance, neither collapsing together nor drifting apart indefinitely
- **Centering force**: a weak force pulls every node gently toward the center of the canvas, preventing the whole graph from drifting off-screen over time
- **Damping**: velocity is multiplied by 0.85 every frame, acting as friction so the simulation settles into a stable layout instead of oscillating forever
- **Dragging override**: while a node is actively being dragged (mouse or touch), physics forces are suspended for that node and its position is set directly from pointer coordinates; releasing it re-enables physics

This runs inside a `useEffect` + `requestAnimationFrame` loop, recalculating all node positions ~60 times per second while the graph page is open.

**Cluster detection** uses a simple graph traversal (iterative DFS via an explicit stack, to avoid recursion depth issues): starting from each unvisited node, it walks all reachable neighbors via the adjacency list built from edges, marking them visited, and increments a cluster counter each time it has to start a new, unvisited component. This is the standard "count connected components" algorithm.

### 2. JWT Session Expiry (Client-Side)

Rather than trusting `localStorage` blindly, the app decodes the JWT's `exp` claim client-side on every app load (`jwt-decode`) and compares it against the current time *before* rendering any route. If expired, the token is purged immediately and the user is treated as logged-out — landing on the public Landing page rather than a broken authenticated view. A secondary axios response interceptor catches any `401` that slips through (e.g., server-side revocation or clock drift) as defense-in-depth.

### 3. Recent Notes (Bounded LRU-style Cache)

The sidebar's "Recent Notes" list is a simple bounded most-recently-used cache implemented directly in React state + `localStorage`: opening a note removes any existing entry for that note ID, unshifts it to the front, and slices the array to a maximum of 5 entries — giving O(n) insert on a tiny fixed-size list, which is effectively constant time in practice.

### 4. Collection & View Filtering

Rather than maintaining separate database collections per view (Starred/Archive/Trash/Collection), every note carries boolean flags (`isPinned`, `isArchived`, `isDeleted`) and an optional `collectionId`. A single `getNotes` endpoint builds a different Mongoose query filter object depending on the requested view — this keeps the schema simple and avoids data duplication or complex joins, at the cost of slightly more logic in the query-builder function.

### 5. AI Prompt Engineering (AI Canvas)

The Groq call uses a fixed system prompt instructing the model to act as "a thoughtful journaling assistant" that converts a described feeling into a 2-4 paragraph reflective note in the user's own voice — explicitly told to avoid titles, greetings, or sign-offs, and to avoid sounding clinical or overly poetic. The user's selected mood chip (if any) is prepended to their free-text prompt before being sent, giving the model extra context without requiring the user to type it out themselves.

---

## Project Structure

```
NextGenNote/
├── backend/
│   ├── config/
│   │   └── db.js                     # (optional) Mongo connection helper
│   ├── controllers/
│   │   ├── authController.js         # register, login, googleLogin
│   │   ├── noteController.js         # CRUD, pin/archive/trash, graph data, linking
│   │   ├── collectionController.js   # create/list/delete collections
│   │   ├── notificationController.js # list/delete/clear notifications
│   │   ├── userController.js         # profile + settings (avatar, theme, greeting)
│   │   └── aiController.js           # Groq API call for AI Canvas
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verification, attaches req.userId
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Collection.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── userRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   └── notify.js                 # shared notification-creation helper
│   ├── .env                          # MONGO_URI, JWT_SECRET, GROQ_API_KEY, PORT
│   ├── package.json
│   └── server.js                     # Express app entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js              # shared instance + interceptors
│   │   │   ├── notes.js
│   │   │   ├── collections.js
│   │   │   ├── notifications.js
│   │   │   ├── user.js
│   │   │   └── ai.js
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MobileTabBar.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── NewNoteCard.jsx
│   │   │   ├── AICanvas.jsx
│   │   │   ├── ProfileMenu.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── CollectionModal.jsx
│   │   │   ├── AddNotesToCollectionModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx / AuthContextStore.js
│   │   │   └── ThemeContext.jsx / ThemeContextStore.js
│   │   ├── constants/
│   │   │   └── avatars.js
│   │   ├── utils/
│   │   │   ├── accounts.js           # multi-account localStorage helpers
│   │   │   └── tokenValid.js         # JWT expiry check
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── ProfileSettings.jsx
│   │   │   └── ConnectingThoughts.jsx
│   │   ├── App.jsx                   # route definitions
│   │   ├── main.jsx
│   │   └── index.css                 # Tailwind entry
│   ├── .env / .env.production        # VITE_API_URL
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Database Schema

**User**
```
name, email (unique), password (hashed, optional for OAuth), googleId,
avatar, darkMode, notificationsEnabled, dashboardGreeting, timestamps
```

**Note**
```
userId (ref User), title, content, isAIGenerated, mood,
isPinned, isArchived, isDeleted, collectionId (ref Collection),
linkedNotes [ref Note], timestamps
```

**Collection**
```
userId (ref User), name, color, timestamps
```

**Notification**
```
userId (ref User), message, timestamps
```

---

## API Reference

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/notes` | List notes (supports `?filter=` or `?collectionId=`) |
| GET | `/api/notes/counts` | Starred/archive/trash counts |
| GET | `/api/notes/graph/data` | Nodes + edges for Connecting Thoughts |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get single note |
| PUT | `/api/notes/:id` | Update title/content |
| PATCH | `/api/notes/:id/pin` | Toggle pin |
| PATCH | `/api/notes/:id/archive` | Archive note |
| PATCH | `/api/notes/:id/restore` | Restore from archive/trash |
| PATCH | `/api/notes/:id/collection` | Assign/remove collection |
| PATCH | `/api/notes/:id/link` | Toggle link to another note |
| DELETE | `/api/notes/:id` | Move to trash |
| DELETE | `/api/notes/:id/permanent` | Permanently delete |
| DELETE | `/api/notes/trash/empty` | Empty trash |
| GET / POST / DELETE | `/api/collections` | List / create / delete collections |
| GET | `/api/notifications` | List notifications |
| DELETE | `/api/notifications/:id` | Delete one |
| DELETE | `/api/notifications/clear` | Clear all |
| GET | `/api/user/me` | Get profile + settings |
| PATCH | `/api/user/settings` | Update avatar/theme/greeting/notifications |
| POST | `/api/ai/generate` | Generate an AI note from a mood + prompt |

All routes except `/auth/*` require a valid `Authorization: Bearer <token>` header.

---

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/nextgennote
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
GOOGLE_CLIENT_ID=your_google_client_id   # optional, if OAuth is enabled
```

**frontend/.env / .env.production**
```
VITE_API_URL=http://localhost:5000/api          # local
VITE_API_URL=https://your-backend.onrender.com/api   # production
VITE_GOOGLE_CLIENT_ID=your_google_client_id      # optional
```

---

## Local Setup

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

---

## Deployment

- **Backend**: deployed on Render as a Node web service, root directory `backend`, build command `npm install`, start command `npm start`. Environment variables set directly in the Render dashboard.
- **Frontend**: deployed on Vercel, root directory `frontend`, framework preset Vite, build command `npm run build`, output directory `dist`. `VITE_API_URL` pointed at the live Render backend URL.
- CORS on the backend is configured to accept requests from the deployed Vercel origin.

---

## Responsive Design Notes

The app was built desktop-first and then systematically retrofitted for mobile/tablet:

- **Sidebar** is hidden entirely below the `sm` breakpoint, replaced by a fixed bottom tab bar (Notes / AI / Alerts / More) with a slide-up sheet for secondary navigation
- **AI Canvas** is a docked 320px side panel on large desktop screens (`lg:` and up) but becomes a full-screen sheet with a dismissible backdrop on everything below that, including tablets — this avoids the panel fighting the sidebar for space at in-between widths
- **Connecting Thoughts** graph shrinks its rendered height progressively across breakpoints and gains real touch-event support (`onTouchStart/Move/End`) for dragging nodes on phones/tablets, not just mouse
- **Grid density control** (3/4/5 columns) is desktop-only (`lg:` and up) and persisted per-browser via `localStorage`, since it has no meaningful effect below that width

---

## Roadmap

Planned but not yet built:
- Mood timeline / emotional insight charts
- AI-generated weekly digest summarizing the week's notes
- "On this day" note resurfacing
- Voice-to-note via the browser's native Speech Recognition API
- Daily writing streak tracking
- PWA support (installable, offline-capable)

---

*Built as a hands-on learning project covering full-stack architecture, JWT authentication, MongoDB schema design, custom physics-based data visualization, and LLM prompt engineering.*
