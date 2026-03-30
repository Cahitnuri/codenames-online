import type { GameState, Player } from '@codenames/shared';
import { ROOM_IDLE_TIMEOUT_MS } from '@codenames/shared';

export interface RoomState {
  roomId: string;
  hostId: string;
  createdAt: number;
  lastActivity: number;
  game: GameState;
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

class RoomManager {
  private rooms = new Map<string, RoomState>();
  private playerRoomIndex = new Map<string, string>(); // socketId → roomId

  createRoom(hostSocketId: string, hostDisplayName: string): RoomState {
    let roomId = generateRoomId();
    while (this.rooms.has(roomId)) {
      roomId = generateRoomId();
    }

    const host: Player = {
      id: hostSocketId,
      displayName: hostDisplayName,
      team: 'spectator',
      role: null,
      connected: true,
    };

    const room: RoomState = {
      roomId,
      hostId: hostSocketId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      game: {
        roomId,
        phase: 'lobby',
        cards: [],
        players: [host],
        teams: {
          red: { team: 'red', score: 0, wordsRemaining: 9, combo: 0, bluffUsed: false, sabotageUsed: false, sabotagedCardId: null },
          blue: { team: 'blue', score: 0, wordsRemaining: 8, combo: 0, bluffUsed: false, sabotageUsed: false, sabotagedCardId: null },
        },
        currentTurn: 'red',
        activeClue: null,
        guessesThisTurn: 0,
        maxGuessesThisTurn: 0,
        bluffActive: false,
        bluffTeam: null,
        timer: { phase: 'idle', startedAt: 0, duration: 0, remaining: 0 },
        turnNumber: 0,
        winner: null,
        winReason: null,
        log: [],
      },
    };

    this.rooms.set(roomId, room);
    this.playerRoomIndex.set(hostSocketId, roomId);
    return room;
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByPlayer(socketId: string): RoomState | undefined {
    const roomId = this.playerRoomIndex.get(socketId);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  addPlayer(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.game.players.push(player);
    room.lastActivity = Date.now();
    this.playerRoomIndex.set(player.id, roomId);
    return true;
  }

  removePlayer(socketId: string): { room: RoomState; wasHost: boolean } | null {
    const roomId = this.playerRoomIndex.get(socketId);
    if (!roomId) return null;
    const room = this.rooms.get(roomId);
    if (!room) return null;

    this.playerRoomIndex.delete(socketId);
    room.game.players = room.game.players.map(p =>
      p.id === socketId ? { ...p, connected: false } : p,
    );
    room.lastActivity = Date.now();

    const wasHost = room.hostId === socketId;

    // Re-assign host to next connected player
    if (wasHost) {
      const nextHost = room.game.players.find(p => p.connected);
      if (nextHost) {
        room.hostId = nextHost.id;
      }
    }

    return { room, wasHost };
  }

  reconnectPlayer(roomId: string, displayName: string, newSocketId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.game.players.find(
      p => p.displayName === displayName && !p.connected,
    );
    if (!player) return null;

    const oldId = player.id;
    this.playerRoomIndex.delete(oldId);
    this.playerRoomIndex.set(newSocketId, roomId);

    player.id = newSocketId;
    player.connected = true;
    room.lastActivity = Date.now();

    // If they were host, update hostId
    if (room.hostId === oldId) {
      room.hostId = newSocketId;
    }

    return player;
  }

  updateGameState(roomId: string, newState: GameState): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.game = newState;
      room.lastActivity = Date.now();
    }
  }

  deleteRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      for (const player of room.game.players) {
        this.playerRoomIndex.delete(player.id);
      }
      this.rooms.delete(roomId);
    }
  }

  pruneStaleRooms(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      if (now - room.lastActivity > ROOM_IDLE_TIMEOUT_MS) {
        this.deleteRoom(roomId);
      }
    }
  }
}

export const roomManager = new RoomManager();
