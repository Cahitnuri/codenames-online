export const BOARD_SIZE = 25;
export const GRID_COLS = 5;

export const FIRST_TEAM_WORDS = 9;
export const SECOND_TEAM_WORDS = 8;
export const NEUTRAL_WORD_COUNT = 7;
export const ASSASSIN_WORD_COUNT = 1;

export const SPYMASTER_TIMER_MS = 30_000;
export const OPERATIVE_TIMER_MS = 60_000;
export const TIMER_TICK_INTERVAL_MS = 1_000;
export const SCORE_UPDATE_DELAY_MS = 1_500;

// Risk bonus: keyed by clue number (4+ uses RISK_BONUS_MAX)
export const RISK_BONUS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
};
export const RISK_BONUS_MAX_THRESHOLD = 4;
export const RISK_BONUS_MAX = 4;

// Combo: { atStreak: consecutive correct guesses, points: bonus for hitting that streak }
export const COMBO_THRESHOLDS = [
  { atStreak: 2, points: 1 },
  { atStreak: 3, points: 2 },
  { atStreak: 4, points: 3 },
] as const;

export const BLUFF_TRIGGER_POINTS = 3;
export const MAX_PLAYERS_PER_ROOM = 16;
export const ROOM_IDLE_TIMEOUT_MS = 30 * 60 * 1_000;
