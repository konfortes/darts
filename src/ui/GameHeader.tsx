import { useState } from 'react';

interface Props {
  onReset: () => void;
  onHistory?: () => void;
}

export function GameHeader({ onReset, onHistory }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="game-header">
      {confirming ? (
        <>
          <span>Reset game?</span>
          <button type="button" className="danger" onClick={onReset}>
            Yes, reset
          </button>
          <button type="button" className="secondary" onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="title">Darts</span>
          {onHistory && (
            <button type="button" className="secondary" onClick={onHistory}>
              History
            </button>
          )}
          <button type="button" className="secondary" onClick={() => setConfirming(true)}>
            Reset
          </button>
        </>
      )}
    </header>
  );
}
