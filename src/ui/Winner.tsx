import { useEffect, useState } from 'react';
import { isSoundEnabled, playFanfare, setSoundEnabled } from '../sound';
import { Confetti } from './Confetti';

interface Props {
  names: string[];
  onStats: () => void;
  onRematch: () => void;
  onNewGame: () => void;
}

export function Winner({ names, onStats, onRematch, onNewGame }: Props) {
  const draw = names.length > 1;
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  useEffect(() => {
    if (isSoundEnabled()) playFanfare();
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playFanfare();
  };

  return (
    <main className="winner">
      <Confetti />
      <button
        type="button"
        className="icon sound-toggle"
        role="switch"
        aria-checked={soundOn}
        aria-label="Sound"
        onClick={toggleSound}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
      <div className="trophy" aria-hidden="true">
        🏆
      </div>
      <h1 className="winner-title">
        <span className="winner-name">{names.join(' & ')}</span> {draw ? 'draw!' : 'wins!'}
      </h1>
      <div className="winner-actions">
        <button type="button" className="secondary" onClick={onStats}>
          Match stats
        </button>
        <button type="button" className="primary" onClick={onRematch}>
          Rematch
        </button>
        <button type="button" className="secondary" onClick={onNewGame}>
          New game
        </button>
      </div>
    </main>
  );
}
