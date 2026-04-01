export type Team = 'red' | 'blue';
export type CardOwner = Team | 'neutral' | 'assassin';
export type PlayerRole = 'spymaster' | 'operative';
export type GamePhase =
  | 'lobby'
  | 'team-selection'
  | 'spymaster-assignment'
  | 'game-start'
  | 'spymaster-turn'
  | 'operative-turn'
  | 'score-update'
  | 'game-end';

export interface Card {
  id: number;
  word: string;
  owner: CardOwner;
  revealed: boolean;
  sabotaged: boolean;
  sabotagedBy: Team | null;
}

export interface Player {
  id: string;
  displayName: string;
  team: Team | 'spectator';
  role: PlayerRole | null;
  connected: boolean;
  avatar?: string;
}

export interface Clue {
  word: string;
  number: number;
  givenBy: string;
  givenAt: number;
  isBluff: boolean;
}

export interface TeamState {
  team: Team;
  score: number;
  wordsRemaining: number;
  combo: number;
  bluffUsed: boolean;
  sabotageUsed: boolean;
  sabotagedCardId: number | null;
}

export interface TimerState {
  phase: 'spymaster' | 'operative' | 'idle';
  startedAt: number;
  duration: number;
  remaining: number;
}

export interface GameLogEntry {
  timestamp: number;
  type: 'clue' | 'guess' | 'turn-end' | 'ability' | 'game-end';
  team: Team;
  payload: Record<string, unknown>;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  cards: Card[];
  players: Player[];
  teams: Record<Team, TeamState>;
  currentTurn: Team;
  activeClue: Clue | null;
  guessesThisTurn: number;
  maxGuessesThisTurn: number;
  bluffActive: boolean;
  bluffTeam: Team | null;
  timer: TimerState;
  turnNumber: number;
  winner: Team | null;
  winReason: 'all-words' | 'assassin' | null;
  log: GameLogEntry[];
  pendingSelections: Record<number, string[]>;
}
