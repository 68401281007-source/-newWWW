# Enterprise Collaboration Suite

Full-stack enterprise web app for internal file sharing, realtime chat, department workspaces, admin management, autosave recovery, and multi-device access.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL with Prisma
- Realtime: Socket.io
- Storage: Local uploads by default, Cloudinary-ready via env vars
- Auth: JWT, refresh token, RBAC, 2FA-ready field model
- Deployment: Docker Compose, Vercel frontend, Railway/Render backend

## Quick Start

```bash
copy .env.example .env
npm.cmd install
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Set `DATABASE_URL` in `.env` to a PostgreSQL database first. Open `http://localhost:3000`. Backend API runs at `http://localhost:4000/api`.

Demo users after seed:

- `admin@company.com` / `Admin123!`
- `manager@company.com` / `Admin123!`
- `employee@company.com` / `Admin123!`

## Docker

```bash
copy .env.example .env
docker compose up --build
```

## Production Deploy

This repo is prepared for:

- Frontend: Vercel
- Backend/API + Socket.io: Railway or Render
- Database: managed PostgreSQL
- File storage: Cloudinary

The backend uses Prisma with PostgreSQL in production. If you still run the old local XAMPP MySQL database, create a PostgreSQL database locally or change `backend/prisma/schema.prisma` back to `mysql` only for that local setup.

### 1. Create online services

1. Create a PostgreSQL database in Railway, Render, Neon, Supabase, or another managed provider.
2. Copy the PostgreSQL `DATABASE_URL`.
3. Create a Cloudinary account and copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Generate long random values for:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

### 2. Deploy backend on Railway

1. Push this project to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add PostgreSQL or paste your external `DATABASE_URL`.
4. Railway will use `railway.json`.
5. Add backend environment variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
JWT_SECRET=your-long-random-secret
JWT_REFRESH_SECRET=your-long-random-refresh-secret
CLIENT_URL=https://your-frontend.vercel.app
PORT=4000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

6. Deploy. The start command runs `prisma migrate deploy` and then starts the API.
7. Open `https://your-backend.railway.app/health`; it should return `{ "ok": true }`.
8. Optional seed after the first deploy:

```bash
npm --workspace backend run db:seed
```

### 3. Deploy backend on Render

Render can use `render.yaml`.

1. Push this project to GitHub.
2. In Render, create a Blueprint from the repo.
3. Render creates a PostgreSQL database and API service.
4. Set `CLIENT_URL` to the final Vercel URL after frontend deployment.
5. Set Cloudinary env vars.
6. Deploy and check `/health`.

### 4. Deploy frontend on Vercel

1. In Vercel, import the GitHub repo.
2. Use the root project; `vercel.json` builds the `frontend` workspace.
3. Add frontend environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

4. Deploy and copy the Vercel URL.
5. Go back to Railway/Render and set backend `CLIENT_URL` to the Vercel URL.
6. Redeploy backend so CORS and Socket.io allow the frontend.

`CLIENT_URL` also accepts multiple comma-separated origins, for example:

```bash
CLIENT_URL=https://your-frontend.vercel.app,https://your-custom-domain.com
```

### 5. Production checks

Run these checks before sharing the link:

1. Backend health: `https://your-backend-url/health`
2. Frontend opens on Vercel.
3. Register or log in.
4. Upload a file and confirm the saved file URL is Cloudinary.
5. Open the app in two browsers and send a chat message; Socket.io should sync in realtime.
6. Edit a page that uses autosave and refresh; the draft should come back from the database.

### Public URL to share

Share the Vercel URL:

```text
https://your-frontend.vercel.app
```

After the backend env is updated with that URL, friends can open it from mobile, desktop, and other machines through a browser.
