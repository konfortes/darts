import { describe, it, expect } from 'vitest';
import { dartLabel } from './dartLabel';

describe('dartLabel', () => {
  it('labels numbers with multiplier prefix', () => {
    expect(dartLabel({ segment: 20, multiplier: 1 })).toBe('20');
    expect(dartLabel({ segment: 20, multiplier: 2 })).toBe('D20');
    expect(dartLabel({ segment: 20, multiplier: 3 })).toBe('T20');
  });
  it('labels outer bull as 25 and bullseye as Bull', () => {
    expect(dartLabel({ segment: 25, multiplier: 1 })).toBe('25');
    expect(dartLabel({ segment: 25, multiplier: 2 })).toBe('Bull');
  });
  it('labels miss', () => {
    expect(dartLabel({ segment: 0, multiplier: 1 })).toBe('Miss');
  });
});
