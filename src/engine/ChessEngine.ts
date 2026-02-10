import {
  Board, Piece, PieceColor, PieceType, Position, Move,
  CastlingRights, GameState, GameStatus, Square
} from './types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(sq => sq ? { ...sq } : null));
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function posKey(p: Position): string {
  return `${p.row},${p.col}`;
}

const FILES = 'abcdefgh';
const PIECE_SYMBOLS: Record<PieceType, string> = {
  p: '', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K'
};

export class ChessEngine {
  private state: GameState;
  private undoneHistory: Move[] = [];

  constructor(fen?: string) {
    this.state = this.parseFEN(fen || INITIAL_FEN);
  }

  getState(): GameState {
    return this.state;
  }

  getBoard(): Board {
    return this.state.board;
  }

  getTurn(): PieceColor {
    return this.state.turn;
  }

  getStatus(): GameStatus {
    return this.state.status;
  }

  getMoveHistory(): Move[] {
    return this.state.moveHistory;
  }

  isGameOver(): boolean {
    return !['active', 'check'].includes(this.state.status);
  }

  // ─── FEN ───────────────────────────────────────────────
  parseFEN(fen: string): GameState {
    const parts = fen.split(' ');
    const board: Board = [];
    const rows = parts[0].split('/');

    for (let r = 0; r < 8; r++) {
      board[r] = [];
      let col = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) {
          for (let i = 0; i < parseInt(ch); i++) board[r][col++] = null;
        } else {
          const color: PieceColor = ch === ch.toUpperCase() ? 'w' : 'b';
          const type = ch.toLowerCase() as PieceType;
          board[r][col++] = { color, type };
        }
      }
    }

    const turn: PieceColor = (parts[1] || 'w') as PieceColor;
    const castling = parts[2] || 'KQkq';
    const castlingRights: CastlingRights = {
      w: { K: castling.includes('K'), Q: castling.includes('Q') },
      b: { K: castling.includes('k'), Q: castling.includes('q') },
    };

    let enPassantTarget: Position | null = null;
    if (parts[3] && parts[3] !== '-') {
      enPassantTarget = {
        col: FILES.indexOf(parts[3][0]),
        row: 8 - parseInt(parts[3][1]),
      };
    }

    const state: GameState = {
      board,
      turn,
      castlingRights,
      enPassantTarget,
      halfMoveClock: parseInt(parts[4] || '0'),
      fullMoveNumber: parseInt(parts[5] || '1'),
      moveHistory: [],
      positionHistory: [],
      status: 'active',
    };

    state.positionHistory.push(this.boardToFENPosition(state));
    state.status = this.computeStatus(state);
    return state;
  }

  toFEN(state?: GameState): string {
    const s = state || this.state;
    let fen = '';

    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const piece = s.board[r][c];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) { fen += empty; empty = 0; }
          const ch = piece.type;
          fen += piece.color === 'w' ? ch.toUpperCase() : ch;
        }
      }
      if (empty > 0) fen += empty;
      if (r < 7) fen += '/';
    }

    fen += ` ${s.turn}`;

    let castling = '';
    if (s.castlingRights.w.K) castling += 'K';
    if (s.castlingRights.w.Q) castling += 'Q';
    if (s.castlingRights.b.K) castling += 'k';
    if (s.castlingRights.b.Q) castling += 'q';
    fen += ` ${castling || '-'}`;

    if (s.enPassantTarget) {
      fen += ` ${FILES[s.enPassantTarget.col]}${8 - s.enPassantTarget.row}`;
    } else {
      fen += ' -';
    }

    fen += ` ${s.halfMoveClock} ${s.fullMoveNumber}`;
    return fen;
  }

  private boardToFENPosition(state: GameState): string {
    // Just board + turn + castling + ep for repetition detection
    const parts = this.toFEN(state).split(' ');
    return parts.slice(0, 4).join(' ');
  }

  // ─── Move Generation ───────────────────────────────────
  getLegalMoves(pos: Position): Move[] {
    const piece = this.state.board[pos.row][pos.col];
    if (!piece || piece.color !== this.state.turn) return [];

    const pseudoMoves = this.getPseudoMoves(pos, this.state);
    return pseudoMoves.filter(m => !this.wouldBeInCheck(m, this.state));
  }

  getAllLegalMoves(color?: PieceColor): Move[] {
    const c = color || this.state.turn;
    const moves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.state.board[r][col];
        if (piece && piece.color === c) {
          const saved = this.state.turn;
          this.state.turn = c;
          moves.push(...this.getLegalMoves({ row: r, col }));
          this.state.turn = saved;
        }
      }
    }
    return moves;
  }

  private getPseudoMoves(pos: Position, state: GameState): Move[] {
    const piece = state.board[pos.row][pos.col];
    if (!piece) return [];

    switch (piece.type) {
      case 'p': return this.getPawnMoves(pos, piece, state);
      case 'n': return this.getKnightMoves(pos, piece, state);
      case 'b': return this.getSlidingMoves(pos, piece, state, [[-1,-1],[-1,1],[1,-1],[1,1]]);
      case 'r': return this.getSlidingMoves(pos, piece, state, [[-1,0],[1,0],[0,-1],[0,1]]);
      case 'q': return this.getSlidingMoves(pos, piece, state, [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
      case 'k': return this.getKingMoves(pos, piece, state);
      default: return [];
    }
  }

  private getPawnMoves(pos: Position, piece: Piece, state: GameState): Move[] {
    const moves: Move[] = [];
    const dir = piece.color === 'w' ? -1 : 1;
    const startRow = piece.color === 'w' ? 6 : 1;
    const promoRow = piece.color === 'w' ? 0 : 7;

    const addMove = (to: Position, captured?: Piece, isEnPassant = false) => {
      if (to.row === promoRow) {
        for (const promotion of ['q', 'r', 'b', 'n'] as PieceType[]) {
          moves.push({ from: pos, to, piece, captured, promotion, isEnPassant });
        }
      } else {
        moves.push({ from: pos, to, piece, captured, isEnPassant });
      }
    };

    // Forward
    const oneStep = { row: pos.row + dir, col: pos.col };
    if (this.inBounds(oneStep) && !state.board[oneStep.row][oneStep.col]) {
      addMove(oneStep);
      // Two steps
      if (pos.row === startRow) {
        const twoStep = { row: pos.row + 2 * dir, col: pos.col };
        if (!state.board[twoStep.row][twoStep.col]) {
          addMove(twoStep);
        }
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const cap = { row: pos.row + dir, col: pos.col + dc };
      if (!this.inBounds(cap)) continue;
      const target = state.board[cap.row][cap.col];
      if (target && target.color !== piece.color) {
        addMove(cap, target);
      }
      // En passant
      if (state.enPassantTarget && posEq(cap, state.enPassantTarget)) {
        const epPiece = state.board[pos.row][cap.col];
        if (epPiece) addMove(cap, epPiece, true);
      }
    }

    return moves;
  }

  private getKnightMoves(pos: Position, piece: Piece, state: GameState): Move[] {
    const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    return this.getStepMoves(pos, piece, state, offsets);
  }

  private getKingMoves(pos: Position, piece: Piece, state: GameState): Move[] {
    const offsets = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    const moves = this.getStepMoves(pos, piece, state, offsets);

    // Castling
    const rights = state.castlingRights[piece.color];
    const row = piece.color === 'w' ? 7 : 0;
    if (pos.row === row && pos.col === 4 && !this.isInCheck(piece.color, state)) {
      if (rights.K && this.canCastle(state, piece.color, 'K')) {
        moves.push({ from: pos, to: { row, col: 6 }, piece, isCastling: 'K' });
      }
      if (rights.Q && this.canCastle(state, piece.color, 'Q')) {
        moves.push({ from: pos, to: { row, col: 2 }, piece, isCastling: 'Q' });
      }
    }

    return moves;
  }

  private canCastle(state: GameState, color: PieceColor, side: 'K' | 'Q'): boolean {
    const row = color === 'w' ? 7 : 0;
    const cols = side === 'K' ? [5, 6] : [1, 2, 3];
    const passCols = side === 'K' ? [5, 6] : [2, 3];

    // Check squares are empty
    for (const c of cols) {
      if (state.board[row][c]) return false;
    }

    // Check king doesn't pass through check
    for (const c of passCols) {
      if (this.isSquareAttacked({ row, col: c }, color, state)) return false;
    }

    // Check rook exists
    const rookCol = side === 'K' ? 7 : 0;
    const rook = state.board[row][rookCol];
    return !!rook && rook.type === 'r' && rook.color === color;
  }

  private getSlidingMoves(pos: Position, piece: Piece, state: GameState, dirs: number[][]): Move[] {
    const moves: Move[] = [];
    for (const [dr, dc] of dirs) {
      let r = pos.row + dr, c = pos.col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = state.board[r][c];
        if (target) {
          if (target.color !== piece.color) {
            moves.push({ from: pos, to: { row: r, col: c }, piece, captured: target });
          }
          break;
        }
        moves.push({ from: pos, to: { row: r, col: c }, piece });
        r += dr; c += dc;
      }
    }
    return moves;
  }

  private getStepMoves(pos: Position, piece: Piece, state: GameState, offsets: number[][]): Move[] {
    const moves: Move[] = [];
    for (const [dr, dc] of offsets) {
      const to = { row: pos.row + dr, col: pos.col + dc };
      if (!this.inBounds(to)) continue;
      const target = state.board[to.row][to.col];
      if (!target || target.color !== piece.color) {
        moves.push({ from: pos, to, piece, captured: target || undefined });
      }
    }
    return moves;
  }

  private inBounds(pos: Position): boolean {
    return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
  }

  // ─── Check Detection ───────────────────────────────────
  isInCheck(color: PieceColor, state?: GameState): boolean {
    const s = state || this.state;
    const kingPos = this.findKing(color, s);
    if (!kingPos) return false;
    return this.isSquareAttacked(kingPos, color, s);
  }

  private isSquareAttacked(pos: Position, byDefender: PieceColor, state: GameState): boolean {
    const attacker: PieceColor = byDefender === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = state.board[r][c];
        if (!piece || piece.color !== attacker) continue;
        const attacks = this.getAttackSquares({ row: r, col: c }, piece, state);
        if (attacks.some(a => posEq(a, pos))) return true;
      }
    }
    return false;
  }

  private getAttackSquares(pos: Position, piece: Piece, state: GameState): Position[] {
    if (piece.type === 'p') {
      const dir = piece.color === 'w' ? -1 : 1;
      return [
        { row: pos.row + dir, col: pos.col - 1 },
        { row: pos.row + dir, col: pos.col + 1 },
      ].filter(p => this.inBounds(p));
    }
    // For other pieces, use pseudo moves (excluding castling)
    const moves = piece.type === 'k'
      ? this.getStepMoves(pos, piece, state, [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
      : this.getPseudoMoves(pos, state);
    return moves.map(m => m.to);
  }

  private findKing(color: PieceColor, state: GameState): Position | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p && p.type === 'k' && p.color === color) return { row: r, col: c };
      }
    }
    return null;
  }

  private wouldBeInCheck(move: Move, state: GameState): boolean {
    const newState = this.applyMoveToState(move, state);
    return this.isInCheck(move.piece.color, newState);
  }

  private applyMoveToState(move: Move, state: GameState): GameState {
    const board = cloneBoard(state.board);
    board[move.from.row][move.from.col] = null;

    if (move.isEnPassant) {
      board[move.from.row][move.to.col] = null;
    }

    let piece = { ...move.piece };
    if (move.promotion) {
      piece = { color: piece.color, type: move.promotion };
    }
    board[move.to.row][move.to.col] = piece;

    if (move.isCastling) {
      const row = move.from.row;
      if (move.isCastling === 'K') {
        board[row][7] = null;
        board[row][5] = { color: move.piece.color, type: 'r' };
      } else {
        board[row][0] = null;
        board[row][3] = { color: move.piece.color, type: 'r' };
      }
    }

    return { ...state, board };
  }

  // ─── Make Move ─────────────────────────────────────────
  makeMove(move: Move): boolean {
    // Validate
    const legalMoves = this.getLegalMoves(move.from);
    const legal = legalMoves.find(m =>
      posEq(m.to, move.to) &&
      m.promotion === move.promotion
    );
    if (!legal) return false;

    const actualMove = { ...legal };

    // Generate SAN before applying
    actualMove.san = this.moveToSAN(actualMove);

    // Apply
    const newBoard = cloneBoard(this.state.board);
    newBoard[actualMove.from.row][actualMove.from.col] = null;

    if (actualMove.isEnPassant) {
      newBoard[actualMove.from.row][actualMove.to.col] = null;
    }

    let placedPiece = { ...actualMove.piece };
    if (actualMove.promotion) {
      placedPiece = { color: placedPiece.color, type: actualMove.promotion };
    }
    newBoard[actualMove.to.row][actualMove.to.col] = placedPiece;

    if (actualMove.isCastling) {
      const row = actualMove.from.row;
      if (actualMove.isCastling === 'K') {
        newBoard[row][7] = null;
        newBoard[row][5] = { color: actualMove.piece.color, type: 'r' };
      } else {
        newBoard[row][0] = null;
        newBoard[row][3] = { color: actualMove.piece.color, type: 'r' };
      }
    }

    // Update castling rights
    const newCastling: CastlingRights = JSON.parse(JSON.stringify(this.state.castlingRights));
    if (actualMove.piece.type === 'k') {
      newCastling[actualMove.piece.color] = { K: false, Q: false };
    }
    if (actualMove.piece.type === 'r') {
      if (actualMove.from.col === 0) newCastling[actualMove.piece.color].Q = false;
      if (actualMove.from.col === 7) newCastling[actualMove.piece.color].K = false;
    }
    if (actualMove.captured?.type === 'r') {
      const capturedColor = actualMove.captured.color;
      if (actualMove.to.col === 0 && actualMove.to.row === (capturedColor === 'w' ? 7 : 0))
        newCastling[capturedColor].Q = false;
      if (actualMove.to.col === 7 && actualMove.to.row === (capturedColor === 'w' ? 7 : 0))
        newCastling[capturedColor].K = false;
    }

    // En passant target
    let newEP: Position | null = null;
    if (actualMove.piece.type === 'p' && Math.abs(actualMove.to.row - actualMove.from.row) === 2) {
      newEP = { row: (actualMove.from.row + actualMove.to.row) / 2, col: actualMove.from.col };
    }

    // Half move clock
    const newHalf = (actualMove.piece.type === 'p' || actualMove.captured)
      ? 0 : this.state.halfMoveClock + 1;

    const newFull = this.state.turn === 'b'
      ? this.state.fullMoveNumber + 1
      : this.state.fullMoveNumber;

    this.state = {
      board: newBoard,
      turn: this.state.turn === 'w' ? 'b' : 'w',
      castlingRights: newCastling,
      enPassantTarget: newEP,
      halfMoveClock: newHalf,
      fullMoveNumber: newFull,
      moveHistory: [...this.state.moveHistory, actualMove],
      positionHistory: [...this.state.positionHistory],
      status: 'active',
    };

    this.state.positionHistory.push(this.boardToFENPosition(this.state));
    this.state.status = this.computeStatus(this.state);

    // Update SAN with check/mate symbols
    if (this.state.status === 'checkmate') {
      actualMove.san += '#';
    } else if (this.state.status === 'check') {
      actualMove.san += '+';
    }

    this.undoneHistory = [];
    return true;
  }

  // ─── Status ────────────────────────────────────────────
  private computeStatus(state: GameState): GameStatus {
    const hasLegalMoves = this.hasAnyLegalMoves(state.turn, state);

    if (!hasLegalMoves) {
      return this.isInCheck(state.turn, state) ? 'checkmate' : 'stalemate';
    }

    if (this.isInCheck(state.turn, state)) return 'check';

    // 50-move rule
    if (state.halfMoveClock >= 100) return 'draw_50move';

    // Threefold repetition
    const currentPos = this.boardToFENPosition(state);
    const count = state.positionHistory.filter(p => p === currentPos).length;
    if (count >= 3) return 'draw_repetition';

    return 'active';
  }

  private hasAnyLegalMoves(color: PieceColor, state: GameState): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = state.board[r][c];
        if (!piece || piece.color !== color) continue;
        const pseudo = this.getPseudoMoves({ row: r, col: c }, state);
        for (const m of pseudo) {
          if (!this.wouldBeInCheck(m, state)) return true;
        }
      }
    }
    return false;
  }

  // ─── SAN ───────────────────────────────────────────────
  private moveToSAN(move: Move): string {
    if (move.isCastling === 'K') return 'O-O';
    if (move.isCastling === 'Q') return 'O-O-O';

    let san = '';
    const symbol = PIECE_SYMBOLS[move.piece.type];

    if (move.piece.type === 'p') {
      if (move.captured) san += FILES[move.from.col];
    } else {
      san += symbol;
      // Disambiguation
      const disambig = this.getDisambiguation(move);
      san += disambig;
    }

    if (move.captured) san += 'x';

    san += FILES[move.to.col] + (8 - move.to.row);

    if (move.promotion) san += '=' + PIECE_SYMBOLS[move.promotion];

    return san;
  }

  private getDisambiguation(move: Move): string {
    const others = this.getAllLegalMoves(move.piece.color).filter(m =>
      m.piece.type === move.piece.type &&
      posEq(m.to, move.to) &&
      !posEq(m.from, move.from)
    );
    if (others.length === 0) return '';
    const sameFile = others.some(m => m.from.col === move.from.col);
    const sameRank = others.some(m => m.from.row === move.from.row);
    if (!sameFile) return FILES[move.from.col];
    if (!sameRank) return String(8 - move.from.row);
    return FILES[move.from.col] + (8 - move.from.row);
  }

  // ─── Undo / Redo ──────────────────────────────────────
  canUndo(): boolean {
    return this.state.moveHistory.length > 0;
  }

  canRedo(): boolean {
    return this.undoneHistory.length > 0;
  }

  undo(): boolean {
    if (!this.canUndo()) return false;
    const moves = [...this.state.moveHistory];
    this.undoneHistory.push(moves.pop()!);
    // Rebuild from scratch
    this.state = this.parseFEN(INITIAL_FEN);
    for (const m of moves) {
      this.makeMove(m);
    }
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) return false;
    const move = this.undoneHistory.pop()!;
    this.makeMove(move);
    return true;
  }

  // ─── PGN ──────────────────────────────────────────────
  toPGN(): string {
    const headers = [
      '[Event "Casual Game"]',
      '[Site "Browser"]',
      `[Date "${new Date().toISOString().split('T')[0].replace(/-/g, '.')}"]`,
      '[White "Player"]',
      '[Black "Player"]',
    ];

    let result = '*';
    if (this.state.status === 'checkmate') {
      result = this.state.turn === 'w' ? '0-1' : '1-0';
    } else if (['stalemate', 'draw_repetition', 'draw_50move'].includes(this.state.status)) {
      result = '1/2-1/2';
    }
    headers.push(`[Result "${result}"]`);

    let pgn = headers.join('\n') + '\n\n';
    const moves = this.state.moveHistory;
    for (let i = 0; i < moves.length; i++) {
      if (i % 2 === 0) pgn += `${Math.floor(i / 2) + 1}. `;
      pgn += (moves[i].san || '??') + ' ';
    }
    pgn += result;

    return pgn;
  }

  loadPGN(pgn: string): boolean {
    try {
      // Extract moves section (after headers)
      const moveSection = pgn.replace(/\[.*?\]\s*/g, '').trim();
      const tokens = moveSection.split(/\s+/).filter(t =>
        t && !t.match(/^\d+\.+$/) && !t.match(/^(1-0|0-1|1\/2-1\/2|\*)$/)
      );

      this.state = this.parseFEN(INITIAL_FEN);
      this.undoneHistory = [];

      for (const token of tokens) {
        const move = this.sanToMove(token);
        if (!move) return false;
        if (!this.makeMove(move)) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private sanToMove(san: string): Move | null {
    const cleanSan = san.replace(/[+#!?]/g, '');
    const allMoves = this.getAllLegalMoves();

    for (const move of allMoves) {
      const moveSan = this.moveToSAN(move).replace(/[+#]/g, '');
      if (moveSan === cleanSan) return move;
    }
    return null;
  }

  resign(): void {
    this.state = { ...this.state, status: 'resigned' };
  }

  timeout(color: PieceColor): void {
    this.state = { ...this.state, status: 'timeout', turn: color };
  }

  reset(fen?: string): void {
    this.state = this.parseFEN(fen || INITIAL_FEN);
    this.undoneHistory = [];
  }
}
