import type { Card, GameState, Player, Team, PlayerRole, Clue, TimerState, TeamState, CardOwner } from './game.types';

// ============================================================
// CLIENT → SERVER
// ============================================================
export interface C2S_Events {
  'room:create': (payload: { displayName: string; avatar?: string }, ack: (res: RoomCreateAck) => void) => void;
  'room:join': (payload: { roomId: string; displayName: string; avatar?: string }, ack: (res: RoomJoinAck) => void) => void;
  'room:leave': () => void;
  'room:reconnect': (payload: { roomId: string; displayName: string; avatar?: string }, ack: (res: RoomJoinAck) => void) => void;
  'player:set-avatar': (payload: { avatar: string }) => void;

  'player:select-team': (payload: { team: Team | 'spectator' }) => void;
  'player:select-role': (payload: { role: PlayerRole }) => void;
  'game:start': () => void;

  'game:give-clue': (payload: { word: string; number: number }) => void;
  'game:guess-word': (payload: { cardId: number }) => void;
  'game:end-turn': () => void;
  'game:indicate-word': (payload: { cardId: number | null }) => void;
  'game:set-settings': (payload: { spymasterMs: number; operativeMs: number }) => void;

  'ability:use-bluff': () => void;
  'ability:use-sabotage': (payload: { cardId: number }) => void;

  'game:rematch': () => void;
}

export interface RoomCreateAck {
  ok: boolean;
  roomId?: string;
  error?: string;
}

export interface RoomJoinAck {
  ok: boolean;
  state?: GameState;
  error?: string;
}

// ============================================================
// SERVER → CLIENT
// ============================================================
export interface S2C_Events {
  'game:sync': (state: GameState) => void;
  'game:cards-update': (cards: Card[]) => void;
  'game:phase-change': (payload: { phase: GameState['phase']; currentTurn: Team }) => void;
  'game:clue-given': (clue: Clue) => void;
  'game:guess-result': (payload: GuessResultPayload) => void;
  'game:turn-ended': (payload: TurnEndPayload) => void;
  'game:timer-tick': (timer: TimerState) => void;
  'game:timer-expired': (payload: { phase: 'spymaster' | 'operative' }) => void;
  'game:over': (payload: GameOverPayload) => void;
  'game:state-update': (state: GameState) => void;

  'team:score-update': (payload: { team: Team; teamState: TeamState }) => void;
  'team:combo-update': (payload: { team: Team; combo: number }) => void;

  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:reconnected': (player: Player) => void;
  'player:state-update': (player: Player) => void;

  'ability:bluff-activated': (payload: { team: Team }) => void;
  'ability:bluff-deactivated': (payload: { team: Team }) => void;
  'ability:sabotage-activated': (payload: { team: Team; cardId: number }) => void;
  'ability:bluff-triggered': (payload: { team: Team; points: number }) => void;

  'game:indications-update': (selections: Record<number, string[]>) => void;

  'error': (payload: { code: string; message: string }) => void;
}

export interface GuessResultPayload {
  cardId: number;
  correct: boolean;
  cardOwner: CardOwner;
  assassin: boolean;
  turnContinues: boolean;
  combo: number;
  scoreGained: number;
}

export interface TurnEndPayload {
  reason: 'wrong-guess' | 'limit-reached' | 'passed' | 'timer' | 'assassin';
  nextTurn: Team;
  scoreSnapshot: Record<Team, number>;
}

export interface GameOverPayload {
  winner: Team;
  reason: GameState['winReason'];
  finalScores: Record<Team, number>;
  redWordsFound: number;
  blueWordsFound: number;
}
