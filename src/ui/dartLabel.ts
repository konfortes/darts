import type { Dart } from '../engine/types';

export function dartLabel(dart: Dart): string {
  if (dart.segment === 0) return 'Miss';
  if (dart.segment === 25) return dart.multiplier === 2 ? 'Bull' : '25';
  const prefix = dart.multiplier === 1 ? '' : dart.multiplier === 2 ? 'D' : 'T';
  return prefix + dart.segment;
}

export function dartClass(dart: Dart): string | undefined {
  if (dart.segment !== 25) return undefined;
  return dart.multiplier === 2 ? 'bullseye' : 'outer-bull';
}
