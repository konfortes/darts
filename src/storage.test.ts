import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame, saveGame, clearGame, STORAGE_KEY } from './storage';

const save = {
  config: { startScore: 301 as const, doubleOut: true, finishRound: false },
  names: ['Ann', 'Bob'],
  darts: [{ segment: 20 as const, multiplier: 3 as const }],
};

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when nothing saved', () => {
    expect(loadGame()).toBeNull();
  });

  it('round-trips a saved game', () => {
    saveGame(save);
    expect(loadGame()).toEqual(save);
  });

  it('clears a saved game', () => {
    saveGame(save);
    clearGame();
    expect(loadGame()).toBeNull();
  });

  it('returns null for corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadGame()).toBeNull();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ names: 'x' }));
    expect(loadGame()).toBeNull();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...save, config: { startScore: 301, doubleOut: true } }));
    expect(loadGame()).toBeNull();
  });
});
