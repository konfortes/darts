export type Segment =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 25;

export type Multiplier = 1 | 2 | 3;

export interface Dart {
  segment: Segment;
  multiplier: Multiplier;
}

export interface GameConfig {
  startScore: 301 | 501;
  doubleOut: boolean;
  finishRound: boolean;
}

export interface PlayerState {
  name: string;
  remaining: number;
}

export interface TurnRecord {
  player: number;
  darts: Dart[];
  bust: boolean;
  total: number;
  remaining: number;
}

export interface GameState {
  players: PlayerState[];
  currentPlayer: number;
  turnDarts: Dart[];
  history: TurnRecord[];
  finished: number[];
  winners: number[];
  over: boolean;
}
