import type { TurnRecord } from '../engine/types';
import { groupRounds } from '../engine/stats';
import { dartClass, dartLabel } from './dartLabel';

interface Props {
  history: TurnRecord[];
  names: string[];
  winners: number[];
}

export function RoundsTable({ history, names, winners }: Props) {
  const rounds = groupRounds(history, names.length);

  return (
    <section>
      <h2>Rounds</h2>
      {rounds.length === 0 ? (
        <p className="history-empty">No turns yet</p>
      ) : (
        <div className="rounds-scroll">
          <table className="rounds-table" aria-label="Rounds">
            <thead>
              <tr>
                <th scope="col" aria-label="Round" />
                {names.map((name, i) => (
                  <th key={i} scope="col" className={winners.includes(i) ? 'winner-col' : undefined}>
                    {winners.includes(i) && <span aria-hidden="true">🏆 </span>}
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, r) => (
                <tr key={r}>
                  <th scope="row">{r + 1}</th>
                  {round.map((turn, i) => (
                    <td key={i} className={turn?.bust ? 'bust' : undefined}>
                      {turn && (
                        <>
                          <span className="round-darts">
                            {turn.darts.map((d, k) => (
                              <span key={k} className={['chip', dartClass(d)].filter(Boolean).join(' ')}>
                                {dartLabel(d)}
                              </span>
                            ))}
                          </span>
                          <span className="round-total">{turn.bust ? 'BUST' : turn.total}</span>
                          <span className="round-remaining">{turn.remaining}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
