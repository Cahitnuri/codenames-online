import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { C2S_Events, S2C_Events } from '@codenames/shared';
import { registerRoomHandlers } from './handlers/room.handlers';
import { registerTeamHandlers } from './handlers/team.handlers';
import { registerGameHandlers } from './handlers/game.handlers';
import { registerAbilityHandlers } from './handlers/ability.handlers';
import { roomManager } from '../state/room.manager';

export function createSocketServer(httpServer: HttpServer, corsOrigin: string): Server<C2S_Events, S2C_Events> {
  const io = new Server<C2S_Events, S2C_Events>(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerTeamHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerAbilityHandlers(io, socket);
  });

  // Prune stale rooms every 5 minutes
  setInterval(() => {
    roomManager.pruneStaleRooms();
  }, 5 * 60 * 1_000);

  return io;
}
