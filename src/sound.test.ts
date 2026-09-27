import { describe, it, expect, beforeEach } from 'vitest';
import { isSoundEnabled, setSoundEnabled, playFanfare, SOUND_KEY } from './sound';

describe('sound preference', () => {
  beforeEach(() => localStorage.clear());

  it('is enabled by default', () => {
    expect(isSoundEnabled()).toBe(true);
  });

  it('persists disable and enable', () => {
    setSoundEnabled(false);
    expect(localStorage.getItem(SOUND_KEY)).toBe('off');
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('playFanfare is a no-op without Web Audio', () => {
    expect('AudioContext' in window).toBe(false);
    expect(() => playFanfare()).not.toThrow();
  });
});
