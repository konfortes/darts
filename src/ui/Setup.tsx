import { useState } from 'react';
import type { GameConfig } from '../engine/types';

interface Props {
  initialConfig?: GameConfig;
  initialNames?: string[];
  onStart: (config: GameConfig, names: string[]) => void;
}

const START_SCORES: GameConfig['startScore'][] = [301, 501];

export function Setup({ initialConfig, initialNames, onStart }: Props) {
  const [names, setNames] = useState(initialNames ?? ['', '']);
  const [startScore, setStartScore] = useState<GameConfig['startScore']>(initialConfig?.startScore ?? 501);
  const [doubleOut, setDoubleOut] = useState(initialConfig?.doubleOut ?? true);
  const [finishRound, setFinishRound] = useState(initialConfig?.finishRound ?? false);

  const trimmed = names.map((n) => n.trim());
  const valid = trimmed.length >= 2 && trimmed.every((n) => n.length > 0);

  const setName = (i: number, value: string) => setNames(names.map((n, j) => (j === i ? value : n)));
  const removeName = (i: number) => setNames(names.filter((_, j) => j !== i));

  return (
    <main className="setup">
      <h1>Darts</h1>

      <section>
        <h2>Players</h2>
        <ul className="player-inputs">
          {names.map((name, i) => (
            <li key={i}>
              <input
                aria-label={`Player ${i + 1} name`}
                placeholder={`Player ${i + 1}`}
                value={name}
                onChange={(e) => setName(i, e.target.value)}
                autoComplete="off"
              />
              {names.length > 2 && (
                <button type="button" className="icon" aria-label={`Remove player ${i + 1}`} onClick={() => removeName(i)}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className="secondary" onClick={() => setNames([...names, ''])}>
          Add player
        </button>
      </section>

      <section>
        <h2>Game</h2>
        <div className="segmented" role="radiogroup" aria-label="Start score">
          {START_SCORES.map((score) => (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={startScore === score}
              onClick={() => setStartScore(score)}
            >
              {score}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={doubleOut} onChange={(e) => setDoubleOut(e.target.checked)} />
          Double-out
        </label>
        <label className="toggle">
          <input type="checkbox" checked={finishRound} onChange={(e) => setFinishRound(e.target.checked)} />
          <span>
            Everyone finishes the round
            <small>Others still throw after a checkout. Fewest darts wins.</small>
          </span>
        </label>
      </section>

      <button type="button" className="primary" disabled={!valid} onClick={() => onStart({ startScore, doubleOut, finishRound }, trimmed)}>
        Start
      </button>
    </main>
  );
}
