export const SOUND_KEY = 'darts:sound';

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'off';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
}

const NOTES = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
const STEP = 0.12;
const CHORD_AT = NOTES.length * STEP;
const CHORD_LENGTH = 0.9;

export function playFanfare(): void {
  if (typeof window.AudioContext !== 'function') return;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(ctx.destination);
  const now = ctx.currentTime;

  NOTES.forEach((freq, i) => tone(ctx, master, freq, now + i * STEP, STEP * 1.6));
  NOTES.forEach((freq) => tone(ctx, master, freq, now + CHORD_AT, CHORD_LENGTH));

  window.setTimeout(() => void ctx.close(), (CHORD_AT + CHORD_LENGTH + 0.2) * 1000);
}

function tone(ctx: AudioContext, out: AudioNode, freq: number, start: number, length: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(1, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + length);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + length);
}
