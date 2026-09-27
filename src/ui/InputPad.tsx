import { useState } from 'react';
import type { Dart, Multiplier, Segment } from '../engine/types';

interface Props {
  canUndo: boolean;
  onDart: (dart: Dart) => void;
  onUndo: () => void;
}

const NUMBERS = Array.from({ length: 20 }, (_, i) => (i + 1) as Segment);
const MULTIPLIERS: { value: Multiplier; label: string; short: string }[] = [
  { value: 1, label: 'Single', short: 'S' },
  { value: 2, label: 'Double', short: 'D' },
  { value: 3, label: 'Triple', short: 'T' },
];

export function InputPad({ canUndo, onDart, onUndo }: Props) {
  const [multiplier, setMultiplier] = useState<Multiplier>(1);

  const throwDart = (segment: Segment, m: Multiplier = multiplier) => {
    onDart({ segment, multiplier: m });
    setMultiplier(1);
  };

  return (
    <section className="pad">
      <div className="multipliers" role="radiogroup" aria-label="Multiplier">
        {MULTIPLIERS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={multiplier === m.value}
            aria-label={m.label}
            onClick={() => setMultiplier(m.value)}
          >
            {m.short}
          </button>
        ))}
      </div>

      <div className="numbers">
        {NUMBERS.map((n) => (
          <button key={n} type="button" onClick={() => throwDart(n)}>
            {n}
          </button>
        ))}
      </div>

      <div className="specials">
        <button type="button" onClick={() => throwDart(0, 1)}>
          Miss
        </button>
        <button type="button" className="outer-bull" onClick={() => throwDart(25, 1)}>
          25
        </button>
        <button type="button" className="bullseye" onClick={() => throwDart(25, 2)}>
          Bull
        </button>
        <button type="button" className="undo" disabled={!canUndo} onClick={onUndo}>
          Undo
        </button>
      </div>
    </section>
  );
}
