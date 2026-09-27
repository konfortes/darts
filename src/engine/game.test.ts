import { describe, it, expect } from 'vitest';
import type { Dart, GameConfig } from './types';
import { dartValue, isValidDart, deriveState } from './game';

const d = (segment: Dart['segment'], multiplier: Dart['multiplier'] = 1): Dart => ({ segment, multiplier });
const S = (s: Dart['segment']) => d(s, 1);
const D = (s: Dart['segment']) => d(s, 2);
const T = (s: Dart['segment']) => d(s, 3);
const MISS = d(0, 1);

const cfg = (over: Partial<GameConfig> = {}): GameConfig => ({ startScore: 501, doubleOut: false, finishRound: false, ...over });
const two = ['Ann', 'Bob'];

describe('dartValue', () => {
  it('multiplies segment by multiplier', () => {
    expect(dartValue(T(20))).toBe(60);
    expect(dartValue(D(25))).toBe(50);
    expect(dartValue(MISS)).toBe(0);
  });
});

describe('isValidDart', () => {
  it('rejects triple bull', () => {
    expect(isValidDart(T(25))).toBe(false);
    expect(isValidDart(D(25))).toBe(true);
  });
  it('rejects miss with multiplier', () => {
    expect(isValidDart(d(0, 2))).toBe(false);
    expect(isValidDart(MISS)).toBe(true);
  });
});

describe('deriveState', () => {
  it('starts with all players at start score, player 0 up', () => {
    const s = deriveState(cfg({ startScore: 301 }), two, []);
    expect(s.players).toEqual([
      { name: 'Ann', remaining: 301 },
      { name: 'Bob', remaining: 301 },
    ]);
    expect(s.currentPlayer).toBe(0);
    expect(s.turnDarts).toEqual([]);
    expect(s.history).toEqual([]);
    expect(s.over).toBe(false);
    expect(s.winners).toEqual([]);
    expect(s.finished).toEqual([]);
  });

  it('subtracts dart values within a turn', () => {
    const s = deriveState(cfg(), two, [T(20), S(5)]);
    expect(s.players[0].remaining).toBe(436);
    expect(s.currentPlayer).toBe(0);
    expect(s.turnDarts).toEqual([T(20), S(5)]);
  });

  it('passes turn after three darts and records last turn', () => {
    const s = deriveState(cfg(), two, [T(20), T(20), T(20)]);
    expect(s.players[0].remaining).toBe(321);
    expect(s.currentPlayer).toBe(1);
    expect(s.turnDarts).toEqual([]);
    expect(s.history).toEqual([{ player: 0, darts: [T(20), T(20), T(20)], bust: false, total: 180, remaining: 321 }]);
  });

  it('rotates through three players and back', () => {
    const turn = [S(1), S(1), S(1)];
    const s = deriveState(cfg(), ['A', 'B', 'C'], [...turn, ...turn, ...turn, S(5)]);
    expect(s.players.map((p) => p.remaining)).toEqual([493, 498, 498]);
    expect(s.currentPlayer).toBe(0);
    expect(s.turnDarts).toEqual([S(5)]);
  });

  it('records every completed turn in order with total and remaining', () => {
    const s = deriveState(cfg(), ['A', 'B', 'C'], [
      T(20), T(20), T(20),
      S(1), S(1), S(1),
      MISS, MISS, MISS,
      S(5),
    ]);
    expect(s.history).toEqual([
      { player: 0, darts: [T(20), T(20), T(20)], bust: false, total: 180, remaining: 321 },
      { player: 1, darts: [S(1), S(1), S(1)], bust: false, total: 3, remaining: 498 },
      { player: 2, darts: [MISS, MISS, MISS], bust: false, total: 0, remaining: 501 },
    ]);
  });

  it('records the winning turn in history', () => {
    const s = deriveState(cfg({ startScore: 301 }), two, [
      T(20), T(20), T(20),
      MISS, MISS, MISS,
      T(20), T(20), S(1),
    ]);
    expect(s.history.at(-1)).toEqual({ player: 0, darts: [T(20), T(20), S(1)], bust: false, total: 121, remaining: 0 });
  });

  it('busts when going below zero, restores turn start score, passes turn', () => {
    const s = deriveState(cfg({ startScore: 301 }), two, [
      T(20), T(20), T(20), // Ann 121
      MISS, MISS, MISS,    // Bob 301
      T(20), T(20), S(2),  // Ann: 121-60-60=1, then -1 -> bust
    ]);
    expect(s.players[0].remaining).toBe(121);
    expect(s.currentPlayer).toBe(1);
    expect(s.turnDarts).toEqual([]);
    expect(s.history.at(-1)).toEqual({ player: 0, darts: [T(20), T(20), S(2)], bust: true, total: 0, remaining: 121 });
  });

  it('wins on exact zero without double-out', () => {
    const s = deriveState(cfg({ startScore: 301 }), two, [
      T(20), T(20), T(20),
      MISS, MISS, MISS,
      T(20), T(20), S(1),
    ]);
    expect(s.players[0].remaining).toBe(0);
    expect(s.over).toBe(true);
    expect(s.winners).toEqual([0]);
    expect(s.finished).toEqual([0]);
    expect(s.currentPlayer).toBe(0);
    expect(s.turnDarts).toEqual([T(20), T(20), S(1)]);
  });

  describe('double-out', () => {
    const start = [T(20), T(20), T(20), MISS, MISS, MISS]; // Ann at 121

    it('busts when landing on 1', () => {
      const s = deriveState(cfg({ startScore: 301, doubleOut: true }), two, [...start, T(20), T(20)]);
      expect(s.players[0].remaining).toBe(121);
      expect(s.currentPlayer).toBe(1);
      expect(s.history.at(-1)?.bust).toBe(true);
    });

    it('busts when landing on 0 with a non-double', () => {
      const s = deriveState(cfg({ startScore: 301, doubleOut: true }), two, [...start, T(20), S(1), T(20)]);
      expect(s.players[0].remaining).toBe(121);
      expect(s.over).toBe(false);
      expect(s.history.at(-1)?.bust).toBe(true);
    });

    it('wins when landing on 0 with a double', () => {
      const s = deriveState(cfg({ startScore: 301, doubleOut: true }), two, [...start, T(7), T(20), D(20)]);
      expect(s.players[0].remaining).toBe(0);
      expect(s.winners).toEqual([0]);
    });

    it('wins when landing on 0 with bull', () => {
      const s = deriveState(cfg({ startScore: 301, doubleOut: true }), two, [...start, T(20), S(11), D(25)]);
      expect(s.winners).toEqual([0]);
    });
  });

  it('undo by removing last dart reverts a bust', () => {
    const log = [T(20), T(20), T(20), MISS, MISS, MISS, T(20), T(20), S(2)];
    const s = deriveState(cfg({ startScore: 301 }), two, log.slice(0, -1));
    expect(s.players[0].remaining).toBe(1);
    expect(s.currentPlayer).toBe(0);
    expect(s.turnDarts).toEqual([T(20), T(20)]);
  });

  it('undo by removing last dart reopens a won game', () => {
    const log = [T(20), T(20), T(20), MISS, MISS, MISS, T(20), T(20), S(1)];
    const s = deriveState(cfg({ startScore: 301 }), two, log.slice(0, -1));
    expect(s.over).toBe(false);
    expect(s.players[0].remaining).toBe(1);
  });

  describe('finish the round', () => {
    const fr = () => cfg({ startScore: 301, finishRound: true });
    const annOut3 = [T(20), T(20), S(1)];
    // Round 1: Ann 121, Bob 301. Ann to throw.
    const r1 = [T(20), T(20), T(20), MISS, MISS, MISS];
    // Two rounds: both at 100. Ann to throw.
    const both100 = [
      T(20), T(20), T(20), T(20), T(20), T(20), // 121 / 121
      S(1), S(1), S(19), S(1), S(1), S(19),     // 100 / 100
    ];

    it('lets remaining players throw after a checkout, then ends the round', () => {
      const mid = deriveState(fr(), two, [...r1, ...annOut3, S(1)]);
      expect(mid.over).toBe(false);
      expect(mid.finished).toEqual([0]);
      expect(mid.players[0].remaining).toBe(0);
      expect(mid.currentPlayer).toBe(1);
      expect(mid.turnDarts).toEqual([S(1)]);

      const end = deriveState(fr(), two, [...r1, ...annOut3, S(1), S(1), S(1)]);
      expect(end.over).toBe(true);
      expect(end.winners).toEqual([0]);
      expect(end.players[1].remaining).toBe(298);
    });

    it('checkout mid-turn ends that turn; next dart belongs to next player', () => {
      const s = deriveState(fr(), two, [...both100, T(20), D(20), S(1)]);
      expect(s.finished).toEqual([0]);
      expect(s.currentPlayer).toBe(1);
      expect(s.turnDarts).toEqual([S(1)]);
      expect(s.history.at(-1)).toEqual({ player: 0, darts: [T(20), D(20)], bust: false, total: 100, remaining: 0 });
    });

    it('fewest darts in the checkout turn wins', () => {
      const s = deriveState(fr(), two, [...both100, T(20), S(20), D(10), T(20), D(20)]);
      expect(s.over).toBe(true);
      expect(s.finished).toEqual([0, 1]);
      expect(s.winners).toEqual([1]);
    });

    it('equal darts in the checkout turn is a draw', () => {
      const s = deriveState(fr(), two, [...both100, T(20), S(20), D(10), T(20), S(20), D(10)]);
      expect(s.winners).toEqual([0, 1]);
    });

    it('first finisher wins when nobody else checks out', () => {
      const s = deriveState(fr(), two, [...both100, T(20), S(20), D(10), T(20), S(20), S(10)]);
      expect(s.over).toBe(true);
      expect(s.winners).toEqual([0]);
      expect(s.players[1].remaining).toBe(10);
    });

    it('is not over until the last player of the round has thrown', () => {
      const log = [
        T(20), T(20), T(20), MISS, MISS, MISS, MISS, MISS, MISS, // A 121
        ...annOut3,                                              // A out
        S(1), S(1), S(1),                                        // B done
        S(1),                                                    // C mid-turn
      ];
      const mid = deriveState(fr(), ['A', 'B', 'C'], log);
      expect(mid.over).toBe(false);
      expect(mid.currentPlayer).toBe(2);

      const end = deriveState(fr(), ['A', 'B', 'C'], [...log, S(1), S(1)]);
      expect(end.over).toBe(true);
      expect(end.winners).toEqual([0]);
    });

    it('ignores darts after the game is over', () => {
      const s = deriveState(fr(), two, [...r1, ...annOut3, S(1), S(1), S(1), T(20)]);
      expect(s.over).toBe(true);
      expect(s.players[0].remaining).toBe(0);
      expect(s.players[1].remaining).toBe(298);
    });
  });
});
