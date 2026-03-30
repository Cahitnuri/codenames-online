import type { Server, Socket } from 'socket.io';
import type { C2S_Events, S2C_Events } from '@codenames/shared';
import { roomManager } from '../../state/room.manager';
import { timerManager } from '../../state/timer.manager';

export function registerRoomHandlers(
  io: Server<C2S_Events, S2C_Events>,
  socket: Socket<C2S_Events, S2C_Events>,
): void {
  socket.on('room:create', ({ displayName }, ack) => {
    const name = displayName.trim().slice(0, 20) || 'Player';
    const room = roomManager.createRoom(socket.id, name);
    socket.join(room.roomId);
    ack({ ok: true, roomId: room.roomId });
  });

  socket.on('room:join', ({ roomId, displayName }, ack) => {
    const room = roomManager.getRoom(roomId.toUpperCase());
    if (!room) {
      ack({ ok: false, error: 'Room not found' });
      return;
    }
    if (room.game.phase !== 'lobby' && room.game.phase !== 'team-selection' && room.game.phase !== 'spymaster-assignment') {
      // Allow spectators to join mid-game too
    }

    const name = displayName.trim().slice(0, 20) || 'Player';
    const existing = room.game.players.find(p => p.displayName === name && !p.connected);
    if (existing) {
      // Reconnect path
      const player = roomManager.reconnectPlayer(roomId.toUpperCase(), name, socket.id);
      if (player) {
        socket.join(roomId.toUpperCase());
        socket.to(roomId.toUpperCase()).emit('player:reconnected', player);
        ack({ ok: true, state: roomManager.getRoom(roomId.toUpperCase())!.game });
        return;
      }
    }

    const player = {
      id: socket.id,
      displayName: name,
      team: 'spectator' as const,
      role: null,
      connected: true,
    };
    roomManager.addPlayer(roomId.toUpperCase(), player);
    socket.join(roomId.toUpperCase());
    socket.to(roomId.toUpperCase()).emit('player:joined', player);
    ack({ ok: true, state: roomManager.getRoom(roomId.toUpperCase())!.game });
  });

  socket.on('room:reconnect', ({ roomId, displayName }, ack) => {
    const player = roomManager.reconnectPlayer(roomId.toUpperCase(), displayName, socket.id);
    if (!player) {
      ack({ ok: false, error: 'Could not reconnect' });
      return;
    }
    socket.join(roomId.toUpperCase());
    socket.to(roomId.toUpperCase()).emit('player:reconnected', player);
    ack({ ok: true, state: roomManager.getRoom(roomId.toUpperCase())!.game });
  });

  socket.on('room:leave', () => {
    handleDisconnect(io, socket);
  });

  socket.on('disconnect', () => {
    handleDisconnect(io, socket);
  });
}

function handleDisconnect(
  io: Server<C2S_Events, S2C_Events>,
  socket: Socket<C2S_Events, S2C_Events>,
): void {
  const result = roomManager.removePlayer(socket.id);
  if (!result) return;

  const { room } = result;
  io.to(room.roomId).emit('player:left', socket.id);

  // If no connected players remain, clean up timer
  const connectedCount = room.game.players.filter(p => p.connected).length;
  if (connectedCount === 0) {
    timerManager.stopTimer(room.roomId);
  }
}
