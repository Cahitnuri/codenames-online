import { io, Socket } from 'socket.io-client';
import type { C2S_Events, S2C_Events } from '@codenames/shared';

const SERVER_URL = (import.meta.env['VITE_SERVER_URL'] as string | undefined) ?? '';

export const socket: Socket<S2C_Events, C2S_Events> = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
