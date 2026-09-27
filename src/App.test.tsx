import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { playFanfare } from './sound';

vi.mock('./sound', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./sound')>()),
  playFanfare: vi.fn(),
}));

async function startGame(names: string[], startScore: 301 | 501 = 301, finishRound = false) {
  const user = userEvent.setup();
  render(<App />);
  const inputs = screen.getAllByLabelText(/player \d name/i);
  for (let i = 0; i < names.length; i++) {
    if (i >= inputs.length) await user.click(screen.getByRole('button', { name: /add player/i }));
    const input = screen.getAllByLabelText(/player \d name/i)[i];
    await user.clear(input);
    await user.type(input, names[i]);
  }
  await user.click(screen.getByRole('radio', { name: String(startScore) }));
  await user.click(screen.getByRole('checkbox', { name: /double-out/i }));
  if (finishRound) await user.click(screen.getByRole('checkbox', { name: /finishes the round/i }));
  await user.click(screen.getByRole('button', { name: /start/i }));
  return user;
}

const throwDart = async (user: ReturnType<typeof userEvent.setup>, mult: 'S' | 'D' | 'T', seg: string) => {
  if (mult !== 'S') await user.click(screen.getByRole('radio', { name: mult === 'D' ? /^double$/i : /^triple$/i }));
  await user.click(screen.getByRole('button', { name: new RegExp(`^${seg}$`, 'i') }));
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(playFanfare).mockClear();
  });

  it('start is disabled until two names are given', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    await user.type(screen.getByLabelText(/player 1 name/i), 'Ann');
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    await user.type(screen.getByLabelText(/player 2 name/i), 'Bob');
    expect(screen.getByRole('button', { name: /start/i })).toBeEnabled();
  });

  it('shows scoreboard with both players at start score', async () => {
    await startGame(['Ann', 'Bob'], 301);
    const ann = screen.getByRole('listitem', { name: /ann/i });
    const bob = screen.getByRole('listitem', { name: /bob/i });
    expect(within(ann).getByText('301')).toBeInTheDocument();
    expect(within(bob).getByText('301')).toBeInTheDocument();
    expect(ann).toHaveAttribute('aria-current', 'true');
  });

  it('scores darts, passes turn, undoes, and declares a winner', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);

    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('121')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /bob/i })).toHaveAttribute('aria-current', 'true');

    await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'S', 'Miss');
    expect(screen.getByRole('listitem', { name: /ann/i })).toHaveAttribute('aria-current', 'true');

    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '2'); // bust
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('121')).toBeInTheDocument();
    expect(screen.getByText(/bust/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('1')).toBeInTheDocument();

    await throwDart(user, 'S', '1');
    expect(screen.getByRole('heading', { name: /ann wins/i })).toBeInTheDocument();
  });

  it('shows last turn darts for every player, not only the previous one', async () => {
    const user = await startGame(['Ann', 'Bob', 'Cid'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', '5');

    expect(screen.getByRole('listitem', { name: /cid/i })).toHaveAttribute('aria-current', 'true');
    const ann = screen.getByRole('listitem', { name: /ann/i });
    const bob = screen.getByRole('listitem', { name: /bob/i });
    expect(within(ann).getAllByText('T20')).toHaveLength(3);
    expect(within(bob).getAllByText('5')).toHaveLength(3);
  });

  it('resumes an in-progress game after remount', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    await throwDart(user, 'T', '20');
    cleanup();

    render(<App />);
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('241')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('T20')).toBeInTheDocument();
  });

  it('reset asks for confirmation, then returns to prefilled setup', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    await throwDart(user, 'T', '20');

    await user.click(screen.getByRole('button', { name: /reset/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByRole('listitem', { name: /ann/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reset/i }));
    await user.click(screen.getByRole('button', { name: /yes, reset/i }));
    expect(screen.getByLabelText(/player 1 name/i)).toHaveValue('Ann');
    expect(screen.getByLabelText(/player 2 name/i)).toHaveValue('Bob');
    expect(screen.getByRole('radio', { name: '301' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /double-out/i })).not.toBeChecked();

    cleanup();
    render(<App />);
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('scores outer bull as 25 and bullseye as 50 regardless of multiplier', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    await user.click(screen.getByRole('radio', { name: /^triple$/i }));
    await user.click(screen.getByRole('button', { name: /^25$/ }));
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('276')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /^triple$/i }));
    await user.click(screen.getByRole('button', { name: /^bull$/i }));
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('226')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('Bull')).toBeInTheDocument();
  });

  it('shows turn history newest first, opened from the header on narrow screens', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', '5');

    await user.click(screen.getByRole('button', { name: /history/i }));
    const rows = within(screen.getByRole('list', { name: /history/i })).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(/Bob.*15.*286/);
    expect(rows[1]).toHaveTextContent(/Ann.*180.*121/);

    await user.click(screen.getByRole('button', { name: /close history/i }));
    expect(screen.queryByRole('list', { name: /history/i })).not.toBeInTheDocument();
  });

  it('plays a fanfare once on win and shows confetti', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '1');

    expect(screen.getByRole('heading', { name: /ann wins/i })).toBeInTheDocument();
    expect(playFanfare).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('confetti').children.length).toBeGreaterThan(20);
  });

  it('mute toggle silences the fanfare and is remembered', async () => {
    localStorage.setItem('darts:sound', 'off');
    const user = await startGame(['Ann', 'Bob'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '1');

    expect(playFanfare).not.toHaveBeenCalled();
    const toggle = screen.getByRole('switch', { name: /sound/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(localStorage.getItem('darts:sound')).toBe('on');
    expect(playFanfare).toHaveBeenCalledTimes(1);
  });

  it('has a finish-the-round checkbox, off by default', () => {
    render(<App />);
    expect(screen.getByRole('checkbox', { name: /finishes the round/i })).not.toBeChecked();
  });

  it('finish the round: others still throw after a checkout, first finisher wins', async () => {
    const user = await startGame(['Ann', 'Bob'], 301, true);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '1');

    expect(screen.queryByRole('heading', { name: /wins/i })).not.toBeInTheDocument();
    const ann = screen.getByRole('listitem', { name: /ann/i });
    expect(within(ann).getByText('0')).toBeInTheDocument();
    expect(within(ann).getByText('OUT')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /bob/i })).toHaveAttribute('aria-current', 'true');

    for (let i = 0; i < 3; i++) await throwDart(user, 'S', '1');
    expect(screen.getByRole('heading', { name: /ann wins/i })).toBeInTheDocument();
  });

  it('finish the round: draw shows both names', async () => {
    const user = await startGame(['Ann', 'Bob'], 301, true);
    for (let i = 0; i < 6; i++) await throwDart(user, 'T', '20'); // 121 / 121
    for (const seg of ['1', '1', '19', '1', '1', '19']) await throwDart(user, 'S', seg); // 100 / 100
    for (let round = 0; round < 2; round++) {
      await throwDart(user, 'T', '20');
      await throwDart(user, 'S', '20');
      await throwDart(user, 'D', '10');
    }
    expect(screen.getByRole('heading', { name: /ann & bob draw/i })).toBeInTheDocument();
  });

  it('shows match stats with per-player numbers and full history after a win', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '1');
    expect(screen.getByRole('heading', { name: /ann wins/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /match stats/i }));
    expect(screen.getByRole('heading', { name: /match stats/i })).toBeInTheDocument();

    const table = screen.getByRole('table', { name: /player stats/i });
    const row = (label: RegExp) => within(table).getByRole('row', { name: label });
    expect(row(/^darts/i)).toHaveTextContent(/6.*3/);
    expect(row(/3-dart avg/i)).toHaveTextContent(/150\.5.*0/);
    expect(row(/misses/i)).toHaveTextContent(/0.*3/);
    expect(row(/highest turn/i)).toHaveTextContent(/180.*0/);
    expect(row(/checkout/i)).toHaveTextContent(/6.*-/);

    const rounds = screen.getByRole('table', { name: /rounds/i });
    const roundRows = within(rounds).getAllByRole('row').slice(1);
    expect(roundRows).toHaveLength(2);
    expect(roundRows[0]).toHaveTextContent(/1.*T20.*T20.*T20.*180.*121.*Miss.*Miss.*Miss.*0.*301/);
    expect(roundRows[1]).toHaveTextContent(/2.*T20.*T20.*1.*121.*0/);

    await user.click(screen.getByRole('button', { name: /rematch/i }));
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('301')).toBeInTheDocument();
  });

  it('rematch keeps players and resets scores', async () => {
    const user = await startGame(['Ann', 'Bob'], 301);
    for (let i = 0; i < 3; i++) await throwDart(user, 'T', '20');
    for (let i = 0; i < 3; i++) await throwDart(user, 'S', 'Miss');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'T', '20');
    await throwDart(user, 'S', '1');
    expect(screen.getByRole('heading', { name: /ann wins/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /rematch/i }));
    expect(within(screen.getByRole('listitem', { name: /ann/i })).getByText('301')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: /bob/i })).getByText('301')).toBeInTheDocument();
  });
});
