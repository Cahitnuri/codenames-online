import { RISK_BONUS, RISK_BONUS_MAX_THRESHOLD, RISK_BONUS_MAX, COMBO_THRESHOLDS, BLUFF_TRIGGER_POINTS } from '@codenames/shared';
import type { CardOwner, Team } from '@codenames/shared';

export function calcRiskBonus(clueNumber: number): number {
  if (clueNumber >= RISK_BONUS_MAX_THRESHOLD) return RISK_BONUS_MAX;
  return RISK_BONUS[clueNumber] ?? 0;
}

// Returns the incremental bonus points gained by reaching newComboCount consecutive guesses
export function calcComboPoints(newComboCount: number): number {
  const match = [...COMBO_THRESHOLDS].reverse().find(t => newComboCount >= t.atStreak);
  if (!match) return 0;
  // Only award the delta for hitting this exact threshold
  const prev = [...COMBO_THRESHOLDS].reverse().find(t => newComboCount - 1 >= t.atStreak);
  return match.points - (prev?.points ?? 0);
}

export function calcBluffTrigger(
  bluffActive: boolean,
  cardOwner: CardOwner,
  guessingTeam: Team,
  bluffTeam: Team | null,
): { triggered: boolean; points: number } {
  if (!bluffActive || bluffTeam === null) return { triggered: false, points: 0 };
  if (cardOwner === bluffTeam && guessingTeam !== bluffTeam) {
    return { triggered: true, points: BLUFF_TRIGGER_POINTS };
  }
  return { triggered: false, points: 0 };
}
