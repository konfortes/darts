import type { GameState } from '../engine/types';
import { DARTS_PER_TURN } from '../engine/game';
import { dartClass, dartLabel } from './dartLabel';

interface Props {
  state: GameState;
}

export function Scoreboard({ state }: Props) {
  const { players, currentPlayer, turnDarts, history, finished } = state;

  return (
    <section className="scoreboard">
      <ul className="players">
        {players.map((p, i) => {
          const isCurrent = i === currentPlayer;
          const isOut = finished.includes(i);
          const lastTurn = history.findLast((t) => t.player === i);
          const darts = isCurrent ? turnDarts : lastTurn?.darts ?? [];
          const bust = !isCurrent && lastTurn?.bust === true;
          return (
            <li
              key={i}
              className={['player', isCurrent && 'current', isOut && 'finished'].filter(Boolean).join(' ')}
              aria-label={p.name}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <div className="player-name">{p.name}</div>
              <div className="player-score">{p.remaining}</div>
              <div className="player-darts">
                {Array.from({ length: DARTS_PER_TURN }, (_, k) => {
                  const dart = darts[k];
                  return (
                    <span key={k} className={['chip', dart ? dartClass(dart) : 'empty'].filter(Boolean).join(' ')}>
                      {dart ? dartLabel(dart) : '–'}
                    </span>
                  );
                })}
                {bust && <span className="chip bust">BUST</span>}
                {isOut && <span className="chip out">OUT</span>}
                {!isCurrent && !bust && !isOut && lastTurn && <span className="chip total">{lastTurn.total}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
