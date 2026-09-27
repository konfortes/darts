import type { Dart, GameConfig } from './engine/types';
import { isValidDart } from './engine/game';

export interface GameSave {
  config: GameConfig;
  names: string[];
  darts: Dart[];
}

export const STORAGE_KEY = 'darts:game';

export function loadGame(): GameSave | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isGameSave(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGame(save: GameSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function clearGame(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function isGameSave(value: unknown): value is GameSave {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const config = v.config as Record<string, unknown> | undefined;
  return (
    typeof config === 'object' &&
    config !== null &&
    (config.startScore === 301 || config.startScore === 501) &&
    typeof config.doubleOut === 'boolean' &&
    typeof config.finishRound === 'boolean' &&
    Array.isArray(v.names) &&
    v.names.length >= 2 &&
    v.names.every((n) => typeof n === 'string' && n.length > 0) &&
    Array.isArray(v.darts) &&
    v.darts.every(isDart)
  );
}

function isDart(value: unknown): value is Dart {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Record<string, unknown>;
  const segment = d.segment;
  const multiplier = d.multiplier;
  if (typeof segment !== 'number' || typeof multiplier !== 'number') return false;
  const segmentOk = (Number.isInteger(segment) && segment >= 0 && segment <= 20) || segment === 25;
  const multiplierOk = multiplier === 1 || multiplier === 2 || multiplier === 3;
  return segmentOk && multiplierOk && isValidDart({ segment, multiplier } as Dart);
}
