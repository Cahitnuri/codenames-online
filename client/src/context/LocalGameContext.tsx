import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { generateBoard } from '../data/localWords';
import type { BoardCard } from '../data/localWords';

// ─── TYPES ────────────────────────────────────────────────────
export interface Profile {
  id: string;
  name: string;
  avatarId: string;
  isGuest: boolean;
}

export interface GameSettings {
  clueTime: number;    // seconds, 0 = unlimited
  guessTime: number;   // seconds, 0 = unlimited
  bonusGuess: boolean; // if true: guessesLeft = count + 1, else = count
}

export interface Clue {
  word: string;
  count: number; // 0 = unlimited
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'red' | 'blue' | 'neutral' | 'assassin' | 'system' | 'winner' | 'clue-red' | 'clue-blue';
}

type AppPhase = 'login' | 'setup' | 'game';
type GamePhase = 'spymaster' | 'operative' | 'over';

interface LocalState {
  appPhase: AppPhase;
  currentProfile: Profile | null;
  savedProfiles: Profile[];
  settings: GameSettings;
  // Game
  board: BoardCard[];
  turn: 'red' | 'blue';
  gamePhase: GamePhase;
  clue: Clue | null;
  guessesLeft: number;
  log: LogEntry[];
  winner: 'red' | 'blue' | null;
  spymasterView: boolean;
  totals: { red: number; blue: number };
  scores: { red: number; blue: number };
  lastRevealedIdx: number;
  showSpyOverlay: boolean;
  timerRemaining: number;
  timerActive: boolean;
}

type Action =
  | { type: 'LOGIN_GUEST'; name: string; avatarId: string }
  | { type: 'LOGIN_PROFILE'; profile: Profile }
  | { type: 'CREATE_PROFILE'; name: string; avatarId: string }
  | { type: 'DELETE_PROFILE'; id: string }
  | { type: 'LOGOUT' }
  | { type: 'GO_SETUP' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'NEW_GAME' }
  | { type: 'TOGGLE_SPY_VIEW' }
  | { type: 'SUBMIT_CLUE'; word: string; count: number }
  | { type: 'GUESS_CARD'; idx: number }
  | { type: 'END_TURN' }
  | { type: 'SPY_CONTINUE' }
  | { type: 'SPY_SKIP' }
  | { type: 'TICK' }
  | { type: 'LOAD_STORAGE'; profiles: Profile[]; settings: Partial<GameSettings> };

// ─── INITIAL STATE ─────────────────────────────────────────────
const DEFAULT_SETTINGS: GameSettings = {
  clueTime: 60,
  guessTime: 90,
  bonusGuess: true,
};

const INITIAL_STATE: LocalState = {
  appPhase: 'login',
  currentProfile: null,
  savedProfiles: [],
  settings: DEFAULT_SETTINGS,
  board: [],
  turn: 'red',
  gamePhase: 'spymaster',
  clue: null,
  guessesLeft: 0,
  log: [],
  winner: null,
  spymasterView: false,
  totals: { red: 9, blue: 8 },
  scores: { red: 0, blue: 0 },
  lastRevealedIdx: -1,
  showSpyOverlay: false,
  timerRemaining: 0,
  timerActive: false,
};

// ─── HELPERS ───────────────────────────────────────────────────
function makeLog(text: string, type: LogEntry['type']): LogEntry {
  return { id: `${Date.now()}-${Math.random()}`, text, type };
}

function addLog(log: LogEntry[], text: string, type: LogEntry['type']): LogEntry[] {
  return [makeLog(text, type), ...log].slice(0, 60);
}

function startNextTurn(state: LocalState): LocalState {
  const nextTurn = state.turn === 'red' ? 'blue' : 'red';
  const timerSecs = state.settings.clueTime;
  return {
    ...state,
    turn: nextTurn,
    gamePhase: 'spymaster',
    clue: null,
    guessesLeft: 0,
    spymasterView: false,
    lastRevealedIdx: -1,
    showSpyOverlay: true,
    timerActive: timerSecs > 0,
    timerRemaining: timerSecs,
  };
}

// ─── REDUCER ───────────────────────────────────────────────────
function reducer(state: LocalState, action: Action): LocalState {
  switch (action.type) {
    case 'LOAD_STORAGE':
      return {
        ...state,
        savedProfiles: action.profiles,
        settings: { ...state.settings, ...action.settings },
      };

    case 'LOGIN_GUEST': {
      const profile: Profile = {
        id: `guest-${Date.now()}`,
        name: action.name,
        avatarId: action.avatarId,
        isGuest: true,
      };
      return { ...state, currentProfile: profile, appPhase: 'setup' };
    }

    case 'CREATE_PROFILE': {
      const profile: Profile = {
        id: `user-${Date.now()}`,
        name: action.name,
        avatarId: action.avatarId,
        isGuest: false,
      };
      const savedProfiles = [...state.savedProfiles, profile];
      return { ...state, currentProfile: profile, savedProfiles, appPhase: 'setup' };
    }

    case 'LOGIN_PROFILE':
      return { ...state, currentProfile: action.profile, appPhase: 'setup' };

    case 'DELETE_PROFILE':
      return {
        ...state,
        savedProfiles: state.savedProfiles.filter(p => p.id !== action.id),
        currentProfile: state.currentProfile?.id === action.id ? null : state.currentProfile,
      };

    case 'LOGOUT':
      return { ...state, currentProfile: null, appPhase: 'login' };

    case 'GO_SETUP':
      return { ...state, appPhase: 'setup' };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'NEW_GAME': {
      const { board, turn, totals } = generateBoard();
      const tName = turn === 'red' ? 'Kırmızı' : 'Mavi';
      const timerSecs = state.settings.clueTime;
      return {
        ...state,
        appPhase: 'game',
        board,
        turn,
        totals,
        gamePhase: 'spymaster',
        clue: null,
        guessesLeft: 0,
        scores: { red: 0, blue: 0 },
        winner: null,
        spymasterView: false,
        showSpyOverlay: true,
        lastRevealedIdx: -1,
        log: [makeLog(`Yeni oyun! ${tName} takım başlıyor (${totals[turn]} kart).`, 'system')],
        timerActive: timerSecs > 0,
        timerRemaining: timerSecs,
      };
    }

    case 'TOGGLE_SPY_VIEW':
      if (state.gamePhase !== 'spymaster') return state;
      return { ...state, spymasterView: !state.spymasterView };

    case 'SPY_CONTINUE':
      return {
        ...state,
        showSpyOverlay: false,
        spymasterView: true,
        timerActive: state.settings.clueTime > 0,
        timerRemaining: state.settings.clueTime,
      };

    case 'SPY_SKIP':
      return { ...state, showSpyOverlay: false, spymasterView: false };

    case 'SUBMIT_CLUE': {
      if (state.gamePhase !== 'spymaster') return state;
      const { word, count } = action;
      const guessesLeft = count === 0 ? 99 : (state.settings.bonusGuess ? count + 1 : count);
      const tName = state.turn === 'red' ? 'Kırmızı' : 'Mavi';
      const timerSecs = state.settings.guessTime;
      return {
        ...state,
        clue: { word: word.toUpperCase(), count },
        guessesLeft,
        gamePhase: 'operative',
        spymasterView: false,
        timerActive: timerSecs > 0,
        timerRemaining: timerSecs,
        log: addLog(state.log, `${tName} Casus: ${word.toUpperCase()} ${count === 0 ? '∞' : count}`, `clue-${state.turn}` as LogEntry['type']),
      };
    }

    case 'GUESS_CARD': {
      if (state.gamePhase !== 'operative' || state.winner) return state;
      const idx = action.idx;
      const card = state.board[idx];
      if (!card || card.revealed) return state;

      const board = state.board.map((c, i) => i === idx ? { ...c, revealed: true } : c);
      const tName  = state.turn === 'red' ? 'Kırmızı' : 'Mavi';
      const oppTeam = state.turn === 'red' ? 'blue' : 'red';
      const oppName = state.turn === 'red' ? 'Mavi' : 'Kırmızı';
      const typeTR  = { red: 'kırmızı', blue: 'mavi', neutral: 'nötr', assassin: 'SUİKASTÇI' }[card.type];

      let log = addLog(state.log, `${tName} → ${card.word.toUpperCase()} (${typeTR})`,
        card.type === 'neutral' ? 'neutral' : card.type as LogEntry['type']);

      // Assassin
      if (card.type === 'assassin') {
        log = addLog(log, `Suikastçı! ${oppName} kazandı!`, 'assassin');
        return { ...state, board, log, winner: oppTeam, gamePhase: 'over', timerActive: false, lastRevealedIdx: idx };
      }

      const scores = { ...state.scores };
      if (card.type === state.turn) {
        scores[state.turn]++;
        if (scores[state.turn] >= state.totals[state.turn]) {
          log = addLog(log, `${tName} kazandı!`, 'winner');
          return { ...state, board, scores, log, winner: state.turn, gamePhase: 'over', timerActive: false, lastRevealedIdx: idx };
        }
        const guessesLeft = state.guessesLeft - 1;
        if (guessesLeft <= 0) {
          log = addLog(log, `${tName} tüm tahminlerini kullandı.`, 'system');
          return startNextTurn({ ...state, board, scores, log, lastRevealedIdx: idx });
        }
        return { ...state, board, scores, guessesLeft, log, lastRevealedIdx: idx };
      } else {
        if (card.type === oppTeam) {
          scores[oppTeam]++;
          if (scores[oppTeam] >= state.totals[oppTeam]) {
            log = addLog(log, `${oppName} kazandı!`, 'winner');
            return { ...state, board, scores, log, winner: oppTeam, gamePhase: 'over', timerActive: false, lastRevealedIdx: idx };
          }
        }
        log = addLog(log, `Yanlış! Sıra ${oppName} takımına geçti.`, 'system');
        return startNextTurn({ ...state, board, scores, log, lastRevealedIdx: idx });
      }
    }

    case 'END_TURN': {
      const tName = state.turn === 'red' ? 'Kırmızı' : 'Mavi';
      return startNextTurn({
        ...state,
        log: addLog(state.log, `${tName} turu erken bitirdi.`, 'system'),
      });
    }

    case 'TICK': {
      if (!state.timerActive) return state;
      if (state.timerRemaining <= 1) {
        if (state.gamePhase === 'spymaster') {
          return startNextTurn({
            ...state,
            timerActive: false,
            timerRemaining: 0,
            log: addLog(state.log, `Süre doldu! Sıra geçiyor.`, 'system'),
          });
        }
        if (state.gamePhase === 'operative') {
          return startNextTurn({
            ...state,
            timerActive: false,
            timerRemaining: 0,
            log: addLog(state.log, `Süre doldu! Sıra geçiyor.`, 'system'),
          });
        }
        return { ...state, timerActive: false, timerRemaining: 0 };
      }
      return { ...state, timerRemaining: state.timerRemaining - 1 };
    }

    default:
      return state;
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────
interface LocalGameContextType {
  state: LocalState;
  loginAsGuest: (name: string, avatarId: string) => void;
  createAccount: (name: string, avatarId: string) => void;
  loginProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;
  logout: () => void;
  goToSetup: () => void;
  updateSettings: (s: Partial<GameSettings>) => void;
  startGame: () => void;
  newGame: () => void;
  toggleSpymasterView: () => void;
  submitClue: (word: string, count: number) => void;
  guessCard: (idx: number) => void;
  endTurn: () => void;
  spyContinue: () => void;
  spySkip: () => void;
}

const LocalGameContext = createContext<LocalGameContextType | null>(null);

export function LocalGameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Load localStorage on mount
  useEffect(() => {
    try {
      const profiles = JSON.parse(localStorage.getItem('lgProfiles') ?? '[]') as Profile[];
      const settings = JSON.parse(localStorage.getItem('lgSettings') ?? '{}') as Partial<GameSettings>;
      dispatch({ type: 'LOAD_STORAGE', profiles, settings });
    } catch { /* ignore */ }
  }, []);

  // Persist savedProfiles + settings
  useEffect(() => {
    localStorage.setItem('lgProfiles', JSON.stringify(state.savedProfiles));
  }, [state.savedProfiles]);

  useEffect(() => {
    localStorage.setItem('lgSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Timer tick
  useEffect(() => {
    if (!state.timerActive || state.timerRemaining <= 0) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.timerActive, state.timerRemaining]);

  const ctx: LocalGameContextType = {
    state,
    loginAsGuest: (name, avatarId) => dispatch({ type: 'LOGIN_GUEST', name, avatarId }),
    createAccount: (name, avatarId) => dispatch({ type: 'CREATE_PROFILE', name, avatarId }),
    loginProfile: (profile) => dispatch({ type: 'LOGIN_PROFILE', profile }),
    deleteProfile: (id) => dispatch({ type: 'DELETE_PROFILE', id }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    goToSetup: () => dispatch({ type: 'GO_SETUP' }),
    updateSettings: (s) => dispatch({ type: 'UPDATE_SETTINGS', settings: s }),
    startGame: () => dispatch({ type: 'NEW_GAME' }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
    toggleSpymasterView: () => dispatch({ type: 'TOGGLE_SPY_VIEW' }),
    submitClue: (word, count) => dispatch({ type: 'SUBMIT_CLUE', word, count }),
    guessCard: (idx) => dispatch({ type: 'GUESS_CARD', idx }),
    endTurn: () => dispatch({ type: 'END_TURN' }),
    spyContinue: () => dispatch({ type: 'SPY_CONTINUE' }),
    spySkip: () => dispatch({ type: 'SPY_SKIP' }),
  };

  return <LocalGameContext.Provider value={ctx}>{children}</LocalGameContext.Provider>;
}

export function useLocalGame() {
  const ctx = useContext(LocalGameContext);
  if (!ctx) throw new Error('useLocalGame must be used inside LocalGameProvider');
  return ctx;
}
