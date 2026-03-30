import type { Card, CardOwner, Team } from '@codenames/shared';
import { FIRST_TEAM_WORDS, SECOND_TEAM_WORDS, NEUTRAL_WORD_COUNT, ASSASSIN_WORD_COUNT, BOARD_SIZE } from '@codenames/shared';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wordsData = require('../../../shared/src/constants/words.json') as { default: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function sampleWords(pool: string[], count: number): string[] {
  return shuffle(pool).slice(0, count);
}

export function assignOwners(firstTeam: Team): CardOwner[] {
  const secondTeam: Team = firstTeam === 'red' ? 'blue' : 'red';
  const owners: CardOwner[] = [
    ...Array<CardOwner>(FIRST_TEAM_WORDS).fill(firstTeam),
    ...Array<CardOwner>(SECOND_TEAM_WORDS).fill(secondTeam),
    ...Array<CardOwner>(NEUTRAL_WORD_COUNT).fill('neutral'),
    ...Array<CardOwner>(ASSASSIN_WORD_COUNT).fill('assassin'),
  ];
  return shuffle(owners);
}

export function createBoard(firstTeam: Team): Card[] {
  const words = sampleWords(wordsData['default'] ?? [], BOARD_SIZE);
  const owners = assignOwners(firstTeam);
  return words.map((word, id) => ({
    id,
    word,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    owner: owners[id]!,
    revealed: false,
    sabotaged: false,
    sabotagedBy: null,
  }));
}

export function applySabotage(cards: Card[], cardId: number, byTeam: Team): Card[] {
  return cards.map(c => c.id === cardId ? { ...c, sabotaged: true, sabotagedBy: byTeam } : c);
}

export function clearSabotageForTeam(cards: Card[], team: Team): Card[] {
  return cards.map(c => c.sabotagedBy === team ? { ...c, sabotaged: false, sabotagedBy: null } : c);
}
