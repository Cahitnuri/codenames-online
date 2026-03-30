import type { Server, Socket } from 'socket.io';
import type { C2S_Events, S2C_Events } from '@codenames/shared';
import { roomManager } from '../../state/room.manager';
import { applySabotage } from '../../engine/board.engine';

export function registerAbilityHandlers(
  io: Server<C2S_Events, S2C_Events>,
  socket: Socket<C2S_Events, S2C_Events>,
): void {
  socket.on('ability:use-bluff', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.role !== 'spymaster' || player.team === 'spectator') return;

    const team = player.team;
    if (game.teams[team].bluffUsed) {
      socket.emit('error', { code: 'BLUFF_USED', message: 'Bluff already used this game' });
      return;
    }
    if (game.phase !== 'spymaster-turn' || game.currentTurn !== team) {
      socket.emit('error', { code: 'WRONG_PHASE', message: 'Can only activate bluff during your spymaster turn' });
      return;
    }

    const toggling = game.bluffActive && game.bluffTeam === team;

    const newState = {
      ...game,
      bluffActive: !toggling,
      bluffTeam: toggling ? null : team,
      teams: {
        ...game.teams,
        [team]: { ...game.teams[team], bluffUsed: !toggling ? true : game.teams[team].bluffUsed },
      },
    };

    roomManager.updateGameState(room.roomId, newState);

    if (!toggling) {
      io.to(room.roomId).emit('ability:bluff-activated', { team });
    } else {
      io.to(room.roomId).emit('ability:bluff-deactivated', { team });
    }
  });

  socket.on('ability:use-sabotage', ({ cardId }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.team === 'spectator') return;

    const team = player.team;
    if (game.teams[team].sabotageUsed) {
      socket.emit('error', { code: 'SABOTAGE_USED', message: 'Sabotage already used this game' });
      return;
    }

    const card = game.cards.find(c => c.id === cardId);
    if (!card || card.revealed || card.sabotaged) {
      socket.emit('error', { code: 'INVALID_CARD', message: 'Cannot sabotage this card' });
      return;
    }

    const newCards = applySabotage(game.cards, cardId, team);
    const newState = {
      ...game,
      cards: newCards,
      teams: {
        ...game.teams,
        [team]: { ...game.teams[team], sabotageUsed: true, sabotagedCardId: cardId },
      },
    };

    roomManager.updateGameState(room.roomId, newState);
    io.to(room.roomId).emit('ability:sabotage-activated', { team, cardId });
    io.to(room.roomId).emit('game:cards-update', newCards);
  });
}
