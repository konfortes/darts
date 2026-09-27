import type { Dart, GameConfig, GameState, TurnRecord } from './types';

export const DARTS_PER_TURN = 3;

export function dartValue(dart: Dart): number {
  return dart.segment * dart.multiplier;
}

export function isValidDart(dart: Dart): boolean {
  if (dart.segment === 0) return dart.multiplier === 1;
  if (dart.segment === 25) return dart.multiplier !== 3;
  return true;
}

interface Checkout {
  player: number;
  darts: number;
}

export function deriveState(config: GameConfig, names: string[], darts: Dart[]): GameState {
  const remaining: number[] = names.map(() => config.startScore);
  let current = 0;
  let turnDarts: Dart[] = [];
  let turnStartScore: number = config.startScore;
  const history: TurnRecord[] = [];
  const checkouts: Checkout[] = [];
  let over = false;

  const recordTurn = (bust: boolean) => {
    history.push({
      player: current,
      darts: turnDarts,
      bust,
      total: turnStartScore - remaining[current],
      remaining: remaining[current],
    });
  };

  const endTurn = (bust: boolean) => {
    recordTurn(bust);
    current = (current + 1) % names.length;
    turnDarts = [];
    turnStartScore = remaining[current];
    if (config.finishRound && current === 0 && checkouts.length > 0) over = true;
  };

  for (const dart of darts) {
    if (over) break;
    turnDarts = [...turnDarts, dart];
    const next = remaining[current] - dartValue(dart);

    const bust =
      next < 0 ||
      (config.doubleOut && next === 1) ||
      (config.doubleOut && next === 0 && dart.multiplier !== 2);

    if (bust) {
      remaining[current] = turnStartScore;
      endTurn(true);
      continue;
    }

    remaining[current] = next;

    if (next === 0) {
      checkouts.push({ player: current, darts: turnDarts.length });
      if (config.finishRound) {
        endTurn(false);
      } else {
        recordTurn(false);
        over = true;
      }
      continue;
    }

    if (turnDarts.length === DARTS_PER_TURN) endTurn(false);
  }

  return {
    players: names.map((name, i) => ({ name, remaining: remaining[i] })),
    currentPlayer: current,
    turnDarts,
    history,
    finished: checkouts.map((c) => c.player),
    winners: over ? pickWinners(checkouts) : [],
    over,
  };
}

function pickWinners(checkouts: Checkout[]): number[] {
  const fewest = Math.min(...checkouts.map((c) => c.darts));
  return checkouts.filter((c) => c.darts === fewest).map((c) => c.player);
}
