import type { Dart, GameConfig, GameState, TurnRecord } from './types';

export interface PlayerStats {
  name: string;
  darts: number;
  turns: number;
  points: number;
  average: number;
  highestTurn: number;
  tons: number;
  misses: number;
  busts: number;
  triples: number;
  doubles: number;
  bulls: number;
  checkoutDarts: number | null;
}

export function computeStats(config: GameConfig, state: GameState): PlayerStats[] {
  return state.players.map((player, i) => {
    const turns = state.history.filter((t) => t.player === i);
    const thrown: Dart[] = turns.flatMap((t) => t.darts);
    if (state.currentPlayer === i && !state.over) thrown.push(...state.turnDarts);

    const points = config.startScore - player.remaining;
    const scoringTurns = turns.filter((t) => !t.bust);
    const finished = state.finished.includes(i);

    return {
      name: player.name,
      darts: thrown.length,
      turns: turns.length,
      points,
      average: thrown.length === 0 ? 0 : (points / thrown.length) * 3,
      highestTurn: Math.max(0, ...scoringTurns.map((t) => t.total)),
      tons: scoringTurns.filter((t) => t.total >= 100).length,
      misses: thrown.filter((d) => d.segment === 0).length,
      busts: turns.filter((t) => t.bust).length,
      triples: thrown.filter((d) => d.multiplier === 3).length,
      doubles: thrown.filter((d) => d.multiplier === 2).length,
      bulls: thrown.filter((d) => d.segment === 25).length,
      checkoutDarts: finished ? thrown.length : null,
    };
  });
}

export function groupRounds(history: TurnRecord[], playerCount: number): (TurnRecord | null)[][] {
  const rounds: (TurnRecord | null)[][] = [];
  history.forEach((turn, i) => {
    const round = Math.floor(i / playerCount);
    rounds[round] ??= Array.from({ length: playerCount }, () => null);
    rounds[round][turn.player] = turn;
  });
  return rounds;
}
