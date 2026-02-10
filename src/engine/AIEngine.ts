import { ChessEngine } from './ChessEngine';
import { Difficulty, Move, PieceColor, PieceType, Position, Board } from './types';

// Piece values
const PIECE_VALUES: Record<PieceType, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
};

// Positional tables (from white's perspective, index 0 = rank 8)
const PAWN_TABLE = [
  [0,0,0,0,0,0,0,0],
  [50,50,50,50,50,50,50,50],
  [10,10,20,30,30,20,10,10],
  [5,5,10,25,25,10,5,5],
  [0,0,0,20,20,0,0,0],
  [5,-5,-10,0,0,-10,-5,5],
  [5,10,10,-20,-20,10,10,5],
  [0,0,0,0,0,0,0,0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,0,0,0,0,-20,-40],
  [-30,0,10,15,15,10,0,-30],
  [-30,5,15,20,20,15,5,-30],
  [-30,0,15,20,20,15,0,-30],
  [-30,5,10,15,15,10,5,-30],
  [-40,-20,0,5,5,0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,0,0,0,0,0,0,-10],
  [-10,0,5,10,10,5,0,-10],
  [-10,5,5,10,10,5,5,-10],
  [-10,0,10,10,10,10,0,-10],
  [-10,10,10,10,10,10,10,-10],
  [-10,5,0,0,0,0,5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_TABLE = [
  [0,0,0,0,0,0,0,0],
  [5,10,10,10,10,10,10,5],
  [-5,0,0,0,0,0,0,-5],
  [-5,0,0,0,0,0,0,-5],
  [-5,0,0,0,0,0,0,-5],
  [-5,0,0,0,0,0,0,-5],
  [-5,0,0,0,0,0,0,-5],
  [0,0,0,5,5,0,0,0],
];

const QUEEN_TABLE = [
  [-20,-10,-10,-5,-5,-10,-10,-20],
  [-10,0,0,0,0,0,0,-10],
  [-10,0,5,5,5,5,0,-10],
  [-5,0,5,5,5,5,0,-5],
  [0,0,5,5,5,5,0,-5],
  [-10,5,5,5,5,5,0,-10],
  [-10,0,5,0,0,0,0,-10],
  [-20,-10,-10,-5,-5,-10,-10,-20],
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20,20,0,0,0,0,20,20],
  [20,30,10,0,0,10,30,20],
];

const TABLES: Record<PieceType, number[][]> = {
  p: PAWN_TABLE, n: KNIGHT_TABLE, b: BISHOP_TABLE,
  r: ROOK_TABLE, q: QUEEN_TABLE, k: KING_TABLE,
};

function evaluateBoard(engine: ChessEngine): number {
  const board = engine.getBoard();
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const table = TABLES[piece.type];
      const tableRow = piece.color === 'w' ? r : 7 - r;
      const value = PIECE_VALUES[piece.type] + table[tableRow][c];
      score += piece.color === 'w' ? value : -value;
    }
  }

  return score;
}

function getDepthForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 3;
    case 'hard': return 4;
  }
}

export function getAIMove(
  engine: ChessEngine,
  difficulty: Difficulty
): Move | null {
  const moves = engine.getAllLegalMoves();
  if (moves.length === 0) return null;

  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = getDepthForDifficulty(difficulty);
  const aiColor = engine.getTurn();
  const isMaximizing = aiColor === 'w';

  let bestMove: Move | null = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Sort moves for better pruning (captures first)
  const sorted = [...moves].sort((a, b) => {
    const aVal = a.captured ? PIECE_VALUES[a.captured.type] : 0;
    const bVal = b.captured ? PIECE_VALUES[b.captured.type] : 0;
    return bVal - aVal;
  });

  for (const move of sorted) {
    // Clone engine, make move, evaluate
    const cloned = new ChessEngine(engine.getState().moveHistory.length === 0
      ? undefined
      : undefined);
    // Rebuild state by replaying from FEN
    const fen = engineToFEN(engine);
    cloned.reset(fen);
    cloned.makeMove(move);

    const score = minimax(cloned, depth - 1, -Infinity, Infinity, !isMaximizing);

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // Add slight randomness for easy
  if (difficulty === 'easy' && bestMove) {
    const candidates = sorted.filter(m => {
      const cloned = new ChessEngine();
      cloned.reset(engineToFEN(engine));
      cloned.makeMove(m);
      const score = minimax(cloned, 0, -Infinity, Infinity, !isMaximizing);
      return Math.abs(score - bestScore) < 50;
    });
    if (candidates.length > 1) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  return bestMove;
}

function minimax(
  engine: ChessEngine,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || engine.isGameOver()) {
    const status = engine.getStatus();
    if (status === 'checkmate') {
      return isMaximizing ? -99999 : 99999;
    }
    if (status === 'stalemate' || status === 'draw_repetition' || status === 'draw_50move') {
      return 0;
    }
    return evaluateBoard(engine);
  }

  const moves = engine.getAllLegalMoves();

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const cloned = new ChessEngine();
      cloned.reset(engineToFEN(engine));
      cloned.makeMove(move);
      const ev = minimax(cloned, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const cloned = new ChessEngine();
      cloned.reset(engineToFEN(engine));
      cloned.makeMove(move);
      const ev = minimax(cloned, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function engineToFEN(engine: ChessEngine): string {
  // Use the engine's toFEN method
  return (engine as any).toFEN();
}
