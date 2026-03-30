import type { GameState, Team, Clue, Card } from '@codenames/shared';
import { FIRST_TEAM_WORDS, SECOND_TEAM_WORDS } from '@codenames/shared';
import { calcRiskBonus, calcComboPoints, calcBluffTrigger } from './scoring.engine';
import { clearSabotageForTeam } from './board.engine';

function oppositeTeam(team: Team): Team {
  return team === 'red' ? 'blue' : 'red';
}

function countWordsRemaining(cards: Card[], team: Team): number {
  return cards.filter(c => c.owner === team && !c.revealed).length;
}

export function applyClue(state: GameState, clue: Clue): GameState {
  return {
    ...state,
    activeClue: clue,
    guessesThisTurn: 0,
    maxGuessesThisTurn: clue.number === 0 ? 99 : clue.number + 1,
    phase: 'operative-turn',
    log: [
      ...state.log,
      {
        timestamp: Date.now(),
        type: 'clue',
        team: state.currentTurn,
        payload: { word: clue.word, number: clue.number, isBluff: clue.isBluff },
      },
    ],
  };
}

export interface GuessResult {
  newState: GameState;
  correct: boolean;
  assassin: boolean;
  turnContinues: boolean;
  scoreGained: number;
  combo: number;
}

export function applyGuess(state: GameState, cardId: number): GuessResult {
  const card = state.cards.find(c => c.id === cardId);
  if (!card || card.revealed || card.sabotaged) {
    return { newState: state, correct: false, assassin: false, turnContinues: false, scoreGained: 0, combo: 0 };
  }

  const guessingTeam = state.currentTurn;
  const correct = card.owner === guessingTeam;
  const assassin = card.owner === 'assassin';

  // Reveal the card
  const newCards = state.cards.map(c => c.id === cardId ? { ...c, revealed: true } : c);

  // Check bluff trigger
  const bluffResult = calcBluffTrigger(state.bluffActive, card.owner, guessingTeam, state.bluffTeam);

  let scoreGained = 0;
  let newCombo = state.teams[guessingTeam].combo;
  let comboPoints = 0;

  if (correct) {
    scoreGained += 1;
    newCombo += 1;
    comboPoints = calcComboPoints(newCombo);
    scoreGained += comboPoints;
  } else {
    newCombo = 0;
  }

  if (bluffResult.triggered) {
    // Points go to bluffTeam (not guessingTeam)
    const bt = state.bluffTeam!;
    const btScore = state.teams[bt].score + bluffResult.points;
    state = {
      ...state,
      teams: {
        ...state.teams,
        [bt]: { ...state.teams[bt], score: btScore },
      },
    };
    scoreGained += 0; // bluff points go to other team, handled above
  }

  const newGuessesThisTurn = state.guessesThisTurn + 1;
  const guessLimitReached = newGuessesThisTurn >= state.maxGuessesThisTurn;

  const newTeamState = {
    ...state.teams[guessingTeam],
    score: state.teams[guessingTeam].score + scoreGained,
    combo: newCombo,
    wordsRemaining: countWordsRemaining(newCards, guessingTeam),
  };

  const newTeams = { ...state.teams, [guessingTeam]: newTeamState };

  // Check win: assassin hit
  if (assassin) {
    const winner = oppositeTeam(guessingTeam);
    return {
      newState: {
        ...state,
        cards: newCards,
        teams: newTeams,
        guessesThisTurn: newGuessesThisTurn,
        phase: 'game-end',
        winner,
        winReason: 'assassin',
        bluffActive: false,
        log: [
          ...state.log,
          { timestamp: Date.now(), type: 'game-end', team: guessingTeam, payload: { reason: 'assassin', winner } },
        ],
      },
      correct: false,
      assassin: true,
      turnContinues: false,
      scoreGained,
      combo: newCombo,
    };
  }

  // Check win: all words found
  if (newTeamState.wordsRemaining === 0) {
    const winner = guessingTeam;
    return {
      newState: {
        ...state,
        cards: newCards,
        teams: newTeams,
        guessesThisTurn: newGuessesThisTurn,
        phase: 'game-end',
        winner,
        winReason: 'all-words',
        bluffActive: false,
        log: [
          ...state.log,
          { timestamp: Date.now(), type: 'game-end', team: guessingTeam, payload: { reason: 'all-words', winner } },
        ],
      },
      correct: true,
      assassin: false,
      turnContinues: false,
      scoreGained,
      combo: newCombo,
    };
  }

  const turnContinues = correct && !guessLimitReached;

  const newState: GameState = {
    ...state,
    cards: newCards,
    teams: newTeams,
    guessesThisTurn: newGuessesThisTurn,
    bluffActive: bluffResult.triggered ? false : state.bluffActive,
    log: [
      ...state.log,
      {
        timestamp: Date.now(),
        type: 'guess',
        team: guessingTeam,
        payload: { cardId, word: card.word, correct, owner: card.owner, scoreGained, combo: newCombo },
      },
    ],
  };

  if (!turnContinues) {
    return {
      newState: applyEndTurn(newState, correct ? 'limit-reached' : 'wrong-guess'),
      correct,
      assassin: false,
      turnContinues: false,
      scoreGained,
      combo: newCombo,
    };
  }

  return { newState, correct, assassin: false, turnContinues: true, scoreGained, combo: newCombo };
}

export function applyEndTurn(state: GameState, reason: string): GameState {
  const nextTeam = oppositeTeam(state.currentTurn);

  // Apply risk bonus if all clue words were guessed correctly this turn
  let riskBonus = 0;
  if (state.activeClue && reason === 'limit-reached') {
    // They guessed exactly clue.number words → all correct
    riskBonus = calcRiskBonus(state.activeClue.number);
  }

  const currentTeamState = state.teams[state.currentTurn];
  const updatedTeamState = {
    ...currentTeamState,
    score: currentTeamState.score + riskBonus,
    combo: 0,
  };

  // Clear the sabotage that the OPPONENT team placed (it affected this turn, now expires)
  const clearedCards = clearSabotageForTeam(state.cards, nextTeam);

  return {
    ...state,
    cards: clearedCards,
    teams: {
      ...state.teams,
      [state.currentTurn]: updatedTeamState,
    },
    currentTurn: nextTeam,
    activeClue: null,
    guessesThisTurn: 0,
    maxGuessesThisTurn: 0,
    bluffActive: false,
    phase: 'spymaster-turn',
    turnNumber: state.turnNumber + 1,
    log: [
      ...state.log,
      {
        timestamp: Date.now(),
        type: 'turn-end',
        team: state.currentTurn,
        payload: { reason, riskBonus, nextTurn: nextTeam },
      },
    ],
  };
}

export function initGameState(roomId: string, firstTeam: Team, cards: Card[], players: GameState['players']): GameState {
  const redWords = firstTeam === 'red' ? FIRST_TEAM_WORDS : SECOND_TEAM_WORDS;
  const blueWords = firstTeam === 'blue' ? FIRST_TEAM_WORDS : SECOND_TEAM_WORDS;

  return {
    roomId,
    phase: 'spymaster-turn',
    cards,
    players,
    teams: {
      red: {
        team: 'red',
        score: 0,
        wordsRemaining: redWords,
        combo: 0,
        bluffUsed: false,
        sabotageUsed: false,
        sabotagedCardId: null,
      },
      blue: {
        team: 'blue',
        score: 0,
        wordsRemaining: blueWords,
        combo: 0,
        bluffUsed: false,
        sabotageUsed: false,
        sabotagedCardId: null,
      },
    },
    currentTurn: firstTeam,
    activeClue: null,
    guessesThisTurn: 0,
    maxGuessesThisTurn: 0,
    bluffActive: false,
    bluffTeam: null,
    timer: { phase: 'spymaster', startedAt: Date.now(), duration: 30_000, remaining: 30_000 },
    turnNumber: 0,
    winner: null,
    winReason: null,
    log: [],
  };
}
