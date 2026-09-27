import type { TurnRecord } from '../engine/types';
import { dartClass, dartLabel } from './dartLabel';

interface Props {
  history: TurnRecord[];
  names: string[];
  onClose?: () => void;
}

export function History({ history, names, onClose }: Props) {
  const rows = history.map((turn, i) => ({ turn, number: i + 1 })).reverse();

  return (
    <aside className={`history${onClose ? ' overlay' : ''}`}>
      <div className="history-header">
        <h2>History</h2>
        {onClose && (
          <button type="button" className="icon" aria-label="Close history" onClick={onClose}>
            ×
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="history-empty">No turns yet</p>
      ) : (
        <ol className="history-list" aria-label="History">
          {rows.map(({ turn, number }) => (
            <li key={number} className={turn.bust ? 'bust' : undefined}>
              <span className="history-turn">#{number}</span>
              <span className="history-player">{names[turn.player]}</span>
              <span className="history-darts">
                {turn.darts.map((d, k) => (
                  <span key={k} className={['chip', dartClass(d)].filter(Boolean).join(' ')}>
                    {dartLabel(d)}
                  </span>
                ))}
              </span>
              <span className="history-total">{turn.bust ? 'BUST' : turn.total}</span>
              <span className="history-remaining">{turn.remaining}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
