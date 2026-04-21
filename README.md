# Museia — AI-powered Museum Ticketing (Web app)

React + Vite + TypeScript + Tailwind, connected to Lovable Cloud (Supabase) for
auth, database, edge functions and Gemini-powered chatbot.

This is the **web app** version. It runs in the browser and uses the cloud
backend that is already provisioned for you (URL + key are in `.env`).

> Want a MERN stack version that saves users to local MongoDB Compass instead?
> Use `museia-mern-v2.zip` from earlier.

---

## Prerequisites

1. **Node.js 18+** — download: https://nodejs.org/
2. A code editor (VS Code recommended)
3. Internet connection (the backend is hosted on Lovable Cloud)

Check Node is installed:
```bash
node -v   # should print v18 or higher
npm -v
```

---

## Run locally — 3 commands

```bash
# 1. Install dependencies
npm install

# 2. Make sure .env exists (it's already in this zip, but if you deleted it):
#    cp .env.example .env

# 3. Start the dev server
npm run dev
```

Open the printed URL (usually **http://localhost:8080**) in your browser.

That's it — sign up, browse 42 Indian museums, book a ticket, chat with the
AI assistant in any language, all hitting the live cloud backend.

---

## What works out of the box

| Feature | Status |
|---|---|
| 42 Indian museums across 24 cities | ✅ live data |
| Shows & exhibitions | ✅ live data |
| Email/password sign-up & sign-in | ✅ |
| **Google sign-in** (one-click) | ✅ |
| Booking flow + QR-code tickets | ✅ |
| `/dashboard` — past & upcoming bookings | ✅ |
| `/custom` — AI-powered recommendations | ✅ Gemini |
| Floating multilingual chatbot | ✅ Gemini |
| Reviews | ✅ |

---

## Build for production

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

You can deploy `/dist` to Vercel, Netlify, GitHub Pages, or any static host.

---

## Run tests

```bash
npm test
```

---

## Project structure

```
src/
├── pages/          Index, Auth, Museums, MuseumDetail, Shows, Exhibitions,
│                   Custom, Book, Ticket, Dashboard, NotFound
├── components/     Layout, NavLink, MuseumCard, Chatbot, ReviewSection,
│                   ui/   ← shadcn-ui components
├── integrations/
│   ├── supabase/   client + auto-generated DB types
│   └── lovable/    Google OAuth helper
├── lib/            seo.ts, utils.ts
└── index.css       design tokens (Tailwind semantic colors)

supabase/
└── functions/      chat/  custom-recommend/  (Deno edge functions, deployed)
```

---

## Common errors

| Error | Fix |
|---|---|
| `npm: command not found` | Install Node.js from https://nodejs.org |
| `Port 8080 in use` | Edit `vite.config.ts` and change `port: 8080` to e.g. `5173` |
| Blank page / "Failed to fetch" | Check `.env` exists and contains the three `VITE_SUPABASE_*` lines |
| Google sign-in blocked | Sign-in popups may be blocked — allow popups for localhost |

---

## Tech stack

- React 18, Vite 5, TypeScript 5
- Tailwind CSS v3 + shadcn-ui
- React Router v6
- TanStack Query
- Supabase JS client (auth, DB)
- Lovable AI Gateway → Google Gemini 3 Flash (chatbot + recommendations)
- qrcode.react (QR ticket rendering)
