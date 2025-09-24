# RTI Assistant

An end-to-end web app to help users draft, refine, and export Indian RTI (Right to Information) applications. It features guided drafting with AI (Gemini), editable output, multi-format export, authentication, and a modern UI with dark/light theme support.

## Features

- Dark/Light theme with accessible hover states
- Authentication: signup, login, JWT cookie session, protected routes
- Draft RTI
  - Generate RTI with user context and selected language via backend (Gemini)
  - Gemini-powered “missing information” clarification questions before generation
  - Editable generated RTI text
  - Multi-language output (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati)
- Export
  - Download as .txt client-side
  - Download as .pdf / .docx by saving draft then exporting via backend
- User Profile
  - Shows avatar and name in navigation when logged in
  - Profile page scaffold to edit details and avatar (wiring endpoints is supported by backend)
- Navigation
  - Redirect to login when visiting My Applications without a valid session
  - Hides login/signup when authenticated; shows avatar + name linking to profile

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Radix UI components
- Backend: Node.js, Express, MongoDB/Mongoose
- AI: Google Gemini (gemini-1.5-flash)

## Monorepo Layout

```
frontend/   # Next.js app
backend/    # Express API
```

## Prerequisites

- Node.js 18+
- pnpm or npm
- MongoDB instance (local or remote)
- Google Gemini API key

## Environment Variables

Create these files:

- frontend/.env.local
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

- backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rti-assistant
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRE=7d
SESSION_SECRET=replace-with-strong-secret
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=replace-with-your-gemini-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

Notes:
- `FRONTEND_URL` and `NEXT_PUBLIC_API_BASE_URL` must match your local/dev URLs to allow credentialed CORS and cookie auth.

## Install & Run

Backend
```
cd backend
npm install
npm run start
```

Frontend
```
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key Flows

### Auth
- Login: `POST /api/auth/login` (sets httpOnly JWT cookie)
- Current user: `GET /api/auth/me`
- Protected routes use the cookie; the frontend calls with `credentials: "include"`.

### Draft & Clarify
- Clarify questions: `POST /api/rti/clarify` returns a small set of targeted questions (Gemini-powered) to collect missing details before generation.
- Generate RTI: `POST /api/rti/generate` uses the user context and selected language to produce the application text and saves a draft (returns `_id`).
- The generated text is editable in the UI; subsequent edits are saved via `PUT /api/rti/:id` before exporting.

### Export
- TXT: client-side download of current edited text.
- PDF/DOCX: saves draft (if needed), then calls `POST /api/export/pdf/:id` or `/api/export/word/:id` and downloads the file.

## Theming

- Implemented with `next-themes` and Tailwind CSS tokens.
- Theme toggle is a simple button (no dropdown) to avoid scroll locking.

## Common Setup Pitfalls

- HTML/JSON parse errors usually mean the frontend called a Next route instead of the backend; verify `NEXT_PUBLIC_API_BASE_URL`.
- Auth not persisting: ensure `FRONTEND_URL` and `credentials: "include"` are set, and that cookies aren’t blocked (check `sameSite` / `secure`).

## Development Scripts (examples)

Backend
```
npm run start    # start API
```

Frontend
```
npm run dev      # start Next.js
```

## License

MIT
