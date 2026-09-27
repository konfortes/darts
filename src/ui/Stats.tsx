import type { PlayerStats } from '../engine/stats';
import type { TurnRecord } from '../engine/types';
import { RoundsTable } from './RoundsTable';

interface Props {
  stats: PlayerStats[];
  history: TurnRecord[];
  winners: number[];
  onBack: () => void;
  onRematch: () => void;
  onNewGame: () => void;
}

interface Row {
  label: string;
  value: (s: PlayerStats) => string;
}

const ROWS: Row[] = [
  { label: 'Darts', value: (s) => String(s.darts) },
  { label: 'Turns', value: (s) => String(s.turns) },
  { label: 'Points', value: (s) => String(s.points) },
  { label: '3-dart avg', value: (s) => s.average.toFixed(1).replace(/\.0$/, '') },
  { label: 'Highest turn', value: (s) => String(s.highestTurn) },
  { label: '100+ turns', value: (s) => String(s.tons) },
  { label: 'Misses', value: (s) => String(s.misses) },
  { label: 'Busts', value: (s) => String(s.busts) },
  { label: 'Triples', value: (s) => String(s.triples) },
  { label: 'Doubles', value: (s) => String(s.doubles) },
  { label: 'Bulls', value: (s) => String(s.bulls) },
  { label: 'Checkout darts', value: (s) => (s.checkoutDarts === null ? '-' : String(s.checkoutDarts)) },
];

export function Stats({ stats, history, winners, onBack, onRematch, onNewGame }: Props) {
  return (
    <main className="stats">
      <header className="game-header">
        <button type="button" className="secondary" onClick={onBack}>
          Back
        </button>
        <h1 className="title">Match stats</h1>
      </header>

      <table className="stats-table" aria-label="Player stats">
        <thead>
          <tr>
            <th scope="col" aria-label="Stat" />
            {stats.map((s, i) => (
              <th key={i} scope="col" className={winners.includes(i) ? 'winner-col' : undefined}>
                {winners.includes(i) && <span aria-hidden="true">🏆 </span>}
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {stats.map((s, i) => (
                <td key={i}>{row.value(s)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <RoundsTable history={history} names={stats.map((s) => s.name)} winners={winners} />

      <div className="winner-actions">
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
