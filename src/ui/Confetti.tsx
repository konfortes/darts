import { useMemo } from 'react';
import type { CSSProperties } from 'react';

const COLORS = ['#22c55e', '#ef4444', '#facc15', '#3b82f6', '#f472b6', '#f97316', '#f1f5f9'];
const COUNT = 80;

export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        style: {
          '--x': `${Math.random() * 100}%`,
          '--delay': `${Math.random() * 2.5}s`,
          '--duration': `${3 + Math.random() * 2.5}s`,
          '--drift': `${(Math.random() - 0.5) * 200}px`,
          '--spin': `${540 + Math.random() * 720}deg`,
          '--size': `${6 + Math.random() * 8}px`,
          '--color': COLORS[i % COLORS.length],
        } as CSSProperties,
      })),
    [],
  );

  return (
    <div className="confetti" aria-hidden="true" data-testid="confetti">
      {pieces.map((p) => (
        <span key={p.id} style={p.style} />
      ))}
    </div>
  );
}
