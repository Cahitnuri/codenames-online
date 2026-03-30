import http from 'http';
import express from 'express';
import cors from 'cors';
import { createSocketServer } from './socket/socket.server';

const PORT = process.env['PORT'] ?? 3001;
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const httpServer = http.createServer(app);
createSocketServer(httpServer, CORS_ORIGIN);

httpServer.listen(PORT, () => {
  console.log(`[server] Codenames server running on port ${PORT}`);
  console.log(`[server] Allowing CORS from: ${CORS_ORIGIN}`);
});
