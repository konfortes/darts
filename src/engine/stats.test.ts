import { describe, it, expect } from 'vitest';
import type { Dart, GameConfig } from './types';
import { deriveState } from './game';
import { computeStats, groupRounds } from './stats';

const d = (segment: Dart['segment'], multiplier: Dart['multiplier'] = 1): Dart => ({ segment, multiplier });
const S = (s: Dart['segment']) => d(s, 1);
const D = (s: Dart['segment']) => d(s, 2);
const T = (s: Dart['segment']) => d(s, 3);
const MISS = d(0, 1);

const cfg: GameConfig = { startScore: 301, doubleOut: false, finishRound: false };
const two = ['Ann', 'Bob'];

describe('computeStats', () => {
  it('returns zeroed stats before any dart', () => {
    const stats = computeStats(cfg, deriveState(cfg, two, []));
    expect(stats[0]).toEqual({
      name: 'Ann',
      darts: 0,
      turns: 0,
      points: 0,
      average: 0,
      highestTurn: 0,
      tons: 0,
      misses: 0,
      busts: 0,
      triples: 0,
      doubles: 0,
      bulls: 0,
      checkoutDarts: null,
    });
  });

  it('counts darts, turns, points, average, highest turn and tons', () => {
    const darts = [
      T(20), T(20), T(20),  // Ann 180
      S(5), MISS, D(25),    // Bob 55
      T(20), T(20), S(1),   // Ann out: 121
    ];
    const stats = computeStats(cfg, deriveState(cfg, two, darts));
    expect(stats[0]).toMatchObject({ darts: 6, turns: 2, points: 301, average: 150.5, highestTurn: 180, tons: 2, checkoutDarts: 6 });
    expect(stats[1]).toMatchObject({ darts: 3, turns: 1, points: 55, average: 55, highestTurn: 55, tons: 0, checkoutDarts: null });
  });

  it('counts misses, triples, doubles and bulls', () => {
    const darts = [T(20), MISS, D(5), S(25), D(25), S(1)];
    const stats = computeStats(cfg, deriveState(cfg, two, darts));
    expect(stats[0]).toMatchObject({ misses: 1, triples: 1, doubles: 1, bulls: 0 });
    expect(stats[1]).toMatchObject({ misses: 0, triples: 0, doubles: 1, bulls: 2 });
  });

  it('bust turns count as zero points and increment busts', () => {
    const darts = [
      T(20), T(20), T(20), MISS, MISS, MISS,
      T(20), T(20), S(2),   // Ann bust
    ];
    const stats = computeStats(cfg, deriveState(cfg, two, darts));
    expect(stats[0]).toMatchObject({ darts: 6, turns: 2, points: 180, busts: 1, average: 90 });
  });

  it('includes the in-progress turn in darts and points', () => {
    const stats = computeStats(cfg, deriveState(cfg, two, [T(20), S(5)]));
    expect(stats[0]).toMatchObject({ darts: 2, turns: 0, points: 65, average: 97.5, misses: 0 });
  });
});

describe('groupRounds', () => {
  it('groups completed turns by round, one slot per player', () => {
    const darts = [
      T(20), T(20), T(20),  // Ann
      S(5), MISS, D(25),    // Bob
      T(20), T(20), S(1),   // Ann out
    ];
    const { history } = deriveState(cfg, two, darts);
    const rounds = groupRounds(history, 2);
    expect(rounds).toHaveLength(2);
    expect(rounds[0].map((t) => t?.total)).toEqual([180, 55]);
    expect(rounds[1].map((t) => t?.total)).toEqual([121, undefined]);
    expect(rounds[1][1]).toBeNull();
  });

  it('returns no rounds when nothing is completed', () => {
    expect(groupRounds([], 3)).toEqual([]);
  });
});
