import { useEffect, useState } from 'react';
import type { Dart, GameConfig } from './engine/types';
import { deriveState } from './engine/game';
import { computeStats } from './engine/stats';
import { clearGame, loadGame, saveGame } from './storage';
import { Setup } from './ui/Setup';
import { GameHeader } from './ui/GameHeader';
import { Scoreboard } from './ui/Scoreboard';
import { InputPad } from './ui/InputPad';
import { Winner } from './ui/Winner';
import { History } from './ui/History';
import { Stats } from './ui/Stats';
import { useMediaQuery } from './ui/useMediaQuery';

type Screen =
  | { kind: 'setup'; config?: GameConfig; names?: string[] }
  | { kind: 'game'; config: GameConfig; names: string[]; darts: Dart[] };

function initialScreen(): Screen {
  const saved = loadGame();
  return saved ? { kind: 'game', ...saved } : { kind: 'setup' };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const wide = useMediaQuery('(min-width: 800px)');

  useEffect(() => {
    if (screen.kind === 'game') saveGame(screen);
    else clearGame();
  }, [screen]);

  if (screen.kind === 'setup') {
    return (
      <Setup
        initialConfig={screen.config}
        initialNames={screen.names}
        onStart={(config, names) => setScreen({ kind: 'game', config, names, darts: [] })}
      />
    );
  }

  const { config, names, darts } = screen;
  const state = deriveState(config, names, darts);
  const toSetup = () => {
    setStatsOpen(false);
    setScreen({ kind: 'setup', config, names });
  };
  const rematch = () => {
    setStatsOpen(false);
    setScreen({ ...screen, darts: [] });
  };

  if (state.over && statsOpen) {
    return (
      <Stats
        stats={computeStats(config, state)}
        history={state.history}
        winners={state.winners}
        onBack={() => setStatsOpen(false)}
        onRematch={rematch}
        onNewGame={toSetup}
      />
    );
  }

  if (state.over) {
    return (
      <Winner
        names={state.winners.map((i) => names[i])}
        onStats={() => setStatsOpen(true)}
        onRematch={rematch}
        onNewGame={toSetup}
      />
    );
  }

  const showHistory = wide || historyOpen;

  return (
    <div className="layout">
      <main className="game">
        <GameHeader onReset={toSetup} onHistory={wide ? undefined : () => setHistoryOpen(true)} />
        <Scoreboard state={state} />
        <InputPad
          canUndo={darts.length > 0}
          onDart={(dart) => setScreen({ ...screen, darts: [...darts, dart] })}
          onUndo={() => setScreen({ ...screen, darts: darts.slice(0, -1) })}
        />
      </main>
      {showHistory && (
        <History
          history={state.history}
          names={names}
          onClose={wide ? undefined : () => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
