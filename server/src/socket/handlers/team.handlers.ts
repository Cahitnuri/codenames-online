import type { Server, Socket } from 'socket.io';
import type { C2S_Events, S2C_Events } from '@codenames/shared';
import { roomManager } from '../../state/room.manager';

export function registerTeamHandlers(
  io: Server<C2S_Events, S2C_Events>,
  socket: Socket<C2S_Events, S2C_Events>,
): void {
  socket.on('player:select-team', ({ team }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const player = room.game.players.find(p => p.id === socket.id);
    if (!player) return;

    // If picking spymaster role for a team, only one spymaster allowed per team
    player.team = team;
    player.role = team === 'spectator' ? null : player.role;

    roomManager.updateGameState(room.roomId, room.game);
    io.to(room.roomId).emit('player:state-update', player);
  });

  socket.on('player:select-role', ({ role }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const player = room.game.players.find(p => p.id === socket.id);
    if (!player || player.team === 'spectator') return;

    if (role === 'spymaster') {
      // Check if team already has a spymaster
      const existingSpymaster = room.game.players.find(
        p => p.team === player.team && p.role === 'spymaster' && p.id !== socket.id,
      );
      if (existingSpymaster) {
        socket.emit('error', { code: 'SPYMASTER_TAKEN', message: 'This team already has a spymaster' });
        return;
      }
    }

    player.role = role;
    roomManager.updateGameState(room.roomId, room.game);
    io.to(room.roomId).emit('player:state-update', player);
  });
}
