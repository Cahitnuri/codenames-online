# Deployment Guide

## Local Development

```bash
cd codenames-online
npm install
npm run dev
```

- Server: http://localhost:3001
- Client: http://localhost:5173

Open two browser tabs, create a room, join from the second tab.

---

## Production Deployment

### 1. Deploy Server to Railway

1. Push this repo to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the repo, set **Root Directory** to `/server`
4. Add environment variables:
   ```
   PORT=3001
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. Railway auto-detects Node.js. Set start command: `npm start`
6. Copy the generated Railway URL (e.g. `https://codenames-server.up.railway.app`)

### 2. Deploy Client to Vercel

1. Go to https://vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `/client`
3. Add environment variable:
   ```
   VITE_SERVER_URL=https://codenames-server.up.railway.app
   ```
4. Deploy. Copy the Vercel URL.
5. Go back to Railway → update `CORS_ORIGIN` to the Vercel URL.

### 3. Alternative: Deploy Server to Render

1. Go to https://render.com → New Web Service
2. Connect repo, set root to `server/`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add same env vars as Railway

### 4. Alternative: Deploy Server to Fly.io

```bash
cd server
fly launch --name codenames-server
fly secrets set CORS_ORIGIN=https://your-app.vercel.app
fly deploy
```

---

## Sharing with Friends

Once deployed:
1. Go to `https://your-app.vercel.app`
2. Create a room → copy the URL
3. Share the URL — friends open it and join instantly, no login required
