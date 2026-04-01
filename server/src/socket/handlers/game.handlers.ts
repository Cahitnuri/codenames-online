import type { Server, Socket } from 'socket.io';
import type { C2S_Events, S2C_Events, Clue, Team } from '@codenames/shared';
import { SPYMASTER_TIMER_MS, OPERATIVE_TIMER_MS } from '@codenames/shared';
import { roomManager } from '../../state/room.manager';
import { timerManager } from '../../state/timer.manager';
import { createBoard } from '../../engine/board.engine';
import { applyClue, applyGuess, applyEndTurn, initGameState } from '../../engine/turn.engine';
import { createTimer } from '../../engine/timer.engine';

export function registerGameHandlers(
  io: Server<C2S_Events, S2C_Events>,
  socket: Socket<C2S_Events, S2C_Events>,
): void {
  socket.on('game:start', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;
    if (room.hostId !== socket.id) {
      socket.emit('error', { code: 'NOT_HOST', message: 'Only the host can start the game' });
      return;
    }

    const redPlayers = room.game.players.filter(p => p.team === 'red');
    const bluePlayers = room.game.players.filter(p => p.team === 'blue');

    if (redPlayers.length < 2 || bluePlayers.length < 2) {
      socket.emit('error', { code: 'NOT_ENOUGH_PLAYERS', message: 'Each team needs at least 2 players' });
      return;
    }

    const redSpymaster = redPlayers.find(p => p.role === 'spymaster');
    const blueSpymaster = bluePlayers.find(p => p.role === 'spymaster');

    if (!redSpymaster || !blueSpymaster) {
      socket.emit('error', { code: 'NO_SPYMASTER', message: 'Each team needs a spymaster' });
      return;
    }

    const firstTeam: Team = 'red'; // Red always goes first (has 9 words)
    const cards = createBoard(firstTeam);
    const newState = initGameState(room.roomId, firstTeam, cards, room.game.players);

    roomManager.updateGameState(room.roomId, newState);
    io.to(room.roomId).emit('game:sync', newState);

    // Start spymaster timer
    startSpymasterTimer(io, room.roomId);
  });

  socket.on('game:give-clue', ({ word, number }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    if (game.phase !== 'spymaster-turn') {
      socket.emit('error', { code: 'WRONG_PHASE', message: 'Not the time to give a clue' });
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.team !== game.currentTurn || player.role !== 'spymaster') {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'It\'s not your turn' });
      return;
    }

    const cleanWord = word.trim().replace(/\s+/g, '').toLowerCase();
    if (!cleanWord || number < 1 || number > 9) {
      socket.emit('error', { code: 'INVALID_CLUE', message: 'Invalid clue' });
      return;
    }

    const clue: Clue = {
      word: cleanWord,
      number,
      givenBy: socket.id,
      givenAt: Date.now(),
      isBluff: game.bluffActive && game.bluffTeam === game.currentTurn,
    };

    const newState = applyClue(game, clue);
    roomManager.updateGameState(room.roomId, newState);

    timerManager.stopTimer(room.roomId);
    io.to(room.roomId).emit('game:clue-given', clue);
    io.to(room.roomId).emit('game:phase-change', { phase: newState.phase, currentTurn: newState.currentTurn });

    startOperativeTimer(io, room.roomId);
  });

  socket.on('game:guess-word', ({ cardId }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    if (game.phase !== 'operative-turn') {
      socket.emit('error', { code: 'WRONG_PHASE', message: 'Not the time to guess' });
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.team !== game.currentTurn || player.role !== 'operative') {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Only operatives of the active team can guess' });
      return;
    }

    const result = applyGuess(game, cardId, socket.id);
    roomManager.updateGameState(room.roomId, result.newState);

    io.to(room.roomId).emit('game:guess-result', {
      cardId,
      correct: result.correct,
      cardOwner: result.newState.cards.find(c => c.id === cardId)!.owner,
      assassin: result.assassin,
      turnContinues: result.turnContinues,
      combo: result.combo,
      scoreGained: result.scoreGained,
    });

    io.to(room.roomId).emit('game:cards-update', result.newState.cards);
    io.to(room.roomId).emit('team:score-update', { team: game.currentTurn, teamState: result.newState.teams[game.currentTurn] });

    if (result.combo >= 2) {
      io.to(room.roomId).emit('team:combo-update', { team: game.currentTurn, combo: result.combo });
    }

    if (result.assassin || result.newState.phase === 'game-end') {
      timerManager.stopTimer(room.roomId);
      io.to(room.roomId).emit('game:over', {
        winner: result.newState.winner!,
        reason: result.newState.winReason,
        finalScores: {
          red: result.newState.teams.red.score,
          blue: result.newState.teams.blue.score,
        },
        redWordsFound: 9 - result.newState.teams.red.wordsRemaining,
        blueWordsFound: 8 - result.newState.teams.blue.wordsRemaining,
      });
      return;
    }

    if (!result.turnContinues) {
      timerManager.stopTimer(room.roomId);
      const nextTurn = result.newState.currentTurn;
      io.to(room.roomId).emit('game:turn-ended', {
        reason: result.correct ? 'limit-reached' : 'wrong-guess',
        nextTurn,
        scoreSnapshot: {
          red: result.newState.teams.red.score,
          blue: result.newState.teams.blue.score,
        },
      });
      io.to(room.roomId).emit('game:phase-change', { phase: result.newState.phase, currentTurn: nextTurn });
      startSpymasterTimer(io, room.roomId);
    }
  });

  socket.on('game:end-turn', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    if (game.phase !== 'operative-turn') return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.team !== game.currentTurn) return;

    const newState = applyEndTurn(game, 'passed');
    roomManager.updateGameState(room.roomId, newState);
    timerManager.stopTimer(room.roomId);

    io.to(room.roomId).emit('game:turn-ended', {
      reason: 'passed',
      nextTurn: newState.currentTurn,
      scoreSnapshot: {
        red: newState.teams.red.score,
        blue: newState.teams.blue.score,
      },
    });
    io.to(room.roomId).emit('game:phase-change', { phase: newState.phase, currentTurn: newState.currentTurn });
    startSpymasterTimer(io, room.roomId);
  });

  socket.on('game:set-settings', ({ spymasterMs, operativeMs }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;
    if (room.hostId !== socket.id) return;
    const clamped = {
      spymasterMs: Math.min(Math.max(spymasterMs, 10_000), 300_000),
      operativeMs: Math.min(Math.max(operativeMs, 10_000), 600_000),
    };
    roomManager.setTimerConfig(room.roomId, clamped);
  });

  socket.on('game:indicate-word', ({ cardId }) => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;

    const { game } = room;
    if (game.phase !== 'operative-turn') return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player || player.team !== game.currentTurn || player.role !== 'operative') return;

    const newSelections: Record<number, string[]> = {};
    for (const [cIdStr, playerIds] of Object.entries(game.pendingSelections ?? {})) {
      const cId = Number(cIdStr);
      const filtered = (playerIds as string[]).filter((pid: string) => pid !== socket.id);
      if (filtered.length > 0) {
        newSelections[cId] = filtered;
      }
    }

    if (cardId !== null) {
      const existingForCard = (game.pendingSelections ?? {})[cardId] ?? [];
      const alreadyIndicated = (existingForCard as string[]).includes(socket.id);
      if (!alreadyIndicated) {
        newSelections[cardId] = [...(newSelections[cardId] ?? []), socket.id];
      }
    }

    game.pendingSelections = newSelections;
    io.to(room.roomId).emit('game:indications-update', newSelections);
  });

  socket.on('game:rematch', () => {
    const room = roomManager.getRoomByPlayer(socket.id);
    if (!room) return;
    if (room.game.phase !== 'game-end') return;

    const firstTeam: Team = 'red';
    const cards = createBoard(firstTeam);
    const newState = initGameState(room.roomId, firstTeam, cards, room.game.players);

    // Reset team states but keep players
    roomManager.updateGameState(room.roomId, newState);
    io.to(room.roomId).emit('game:sync', newState);
    startSpymasterTimer(io, room.roomId);
  });
}

function startSpymasterTimer(io: Server<C2S_Events, S2C_Events>, roomId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  const duration = room.timerConfig?.spymasterMs ?? SPYMASTER_TIMER_MS;
  const timer = createTimer('spymaster', duration);
  room.game.timer = timer;

  timerManager.startTimer(
    roomId,
    'spymaster',
    (remaining) => {
      const r = roomManager.getRoom(roomId);
      if (!r) return;
      r.game.timer = { ...r.game.timer, remaining };
      io.to(roomId).emit('game:timer-tick', r.game.timer);
    },
    () => {
      const r = roomManager.getRoom(roomId);
      if (!r || r.game.phase !== 'spymaster-turn') return;

      io.to(roomId).emit('game:timer-expired', { phase: 'spymaster' });
      const newState = applyEndTurn(r.game, 'timer');
      roomManager.updateGameState(roomId, newState);
      io.to(roomId).emit('game:phase-change', { phase: newState.phase, currentTurn: newState.currentTurn });
      io.to(roomId).emit('game:turn-ended', {
        reason: 'timer',
        nextTurn: newState.currentTurn,
        scoreSnapshot: { red: newState.teams.red.score, blue: newState.teams.blue.score },
      });
      io.to(roomId).emit('game:indications-update', {});
      startSpymasterTimer(io, roomId);
    },
    duration,
  );
}

function startOperativeTimer(io: Server<C2S_Events, S2C_Events>, roomId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  const duration = room.timerConfig?.operativeMs ?? OPERATIVE_TIMER_MS;
  const timer = createTimer('operative', duration);
  room.game.timer = timer;

  timerManager.startTimer(
    roomId,
    'operative',
    (remaining) => {
      const r = roomManager.getRoom(roomId);
      if (!r) return;
      r.game.timer = { ...r.game.timer, remaining };
      io.to(roomId).emit('game:timer-tick', r.game.timer);
    },
    () => {
      const r = roomManager.getRoom(roomId);
      if (!r || r.game.phase !== 'operative-turn') return;

      io.to(roomId).emit('game:timer-expired', { phase: 'operative' });
      const newState = applyEndTurn(r.game, 'timer');
      roomManager.updateGameState(roomId, newState);
      io.to(roomId).emit('game:turn-ended', {
        reason: 'timer',
        nextTurn: newState.currentTurn,
        scoreSnapshot: { red: newState.teams.red.score, blue: newState.teams.blue.score },
      });
      io.to(roomId).emit('game:phase-change', { phase: newState.phase, currentTurn: newState.currentTurn });
      io.to(roomId).emit('game:indications-update', {});
      startSpymasterTimer(io, roomId);
    },
    duration,
  );
}
