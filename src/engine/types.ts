export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export type Square = Piece | null;
export type Board = Square[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  isCastling?: 'K' | 'Q';
  isEnPassant?: boolean;
  san?: string;
}

export interface CastlingRights {
  w: { K: boolean; Q: boolean };
  b: { K: boolean; Q: boolean };
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: Move[];
  positionHistory: string[];
  status: GameStatus;
}

export type GameStatus =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_repetition'
  | 'draw_50move'
  | 'resigned'
  | 'timeout';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'ai' | 'local';

export type ClockMode = 'none' | 'blitz' | 'rapid' | 'custom';

export type BoardTheme = 'classic' | 'dark' | 'wood';
export type PieceStyle = 'staunton' | 'minimal';

export interface GameSettings {
  boardTheme: BoardTheme;
  pieceStyle: PieceStyle;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showLastMove: boolean;
  showCoordinates: boolean;
  highContrast: boolean;
}

export interface NewGameOptions {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PieceColor | 'random';
  clockMode: ClockMode;
  customTime?: number;
}
