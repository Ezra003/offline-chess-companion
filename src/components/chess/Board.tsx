import { useState, useCallback } from 'react';
import { ChessEngine } from '@/engine/ChessEngine';
import { Position, Move, GameSettings, PieceColor } from '@/engine/types';
import { SquareComponent } from './SquareComponent';
import { PieceDisplay } from './PieceDisplay';
import { PromotionDialog } from './PromotionDialog';

interface BoardProps {
  engine: ChessEngine;
  settings: GameSettings;
  flipped: boolean;
  onMove: (move: Move) => void;
  disabled?: boolean;
}

export function Board({ engine, settings, flipped, onMove, disabled }: BoardProps) {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: Position; to: Position } | null>(null);
  const [dragFrom, setDragFrom] = useState<Position | null>(null);

  const board = engine.getBoard();
  const state = engine.getState();
  const lastMove = state.moveHistory.length > 0
    ? state.moveHistory[state.moveHistory.length - 1]
    : null;

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (disabled) return;
    const pos = { row, col };

    if (selectedPos) {
      // Try to move
      const move = legalMoves.find(m => m.to.row === row && m.to.col === col);
      if (move) {
        if (move.piece.type === 'p' && (row === 0 || row === 7)) {
          setPromotionMove({ from: selectedPos, to: pos });
        } else {
          onMove(move);
        }
        setSelectedPos(null);
        setLegalMoves([]);
        return;
      }
    }

    // Select piece
    const piece = board[row][col];
    if (piece && piece.color === engine.getTurn()) {
      setSelectedPos(pos);
      setLegalMoves(engine.getLegalMoves(pos));
    } else {
      setSelectedPos(null);
      setLegalMoves([]);
    }
  }, [selectedPos, legalMoves, board, engine, onMove, disabled]);

  const handleDragStart = useCallback((e: React.DragEvent, row: number, col: number) => {
    if (disabled) return;
    const piece = board[row][col];
    if (!piece || piece.color !== engine.getTurn()) {
      e.preventDefault();
      return;
    }
    setDragFrom({ row, col });
    setSelectedPos({ row, col });
    setLegalMoves(engine.getLegalMoves({ row, col }));
    e.dataTransfer.effectAllowed = 'move';
  }, [board, engine, disabled]);

  const handleDrop = useCallback((e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (!dragFrom || disabled) return;
    const moves = engine.getLegalMoves(dragFrom);
    const move = moves.find(m => m.to.row === row && m.to.col === col);
    if (move) {
      if (move.piece.type === 'p' && (row === 0 || row === 7)) {
        setPromotionMove({ from: dragFrom, to: { row, col } });
      } else {
        onMove(move);
      }
    }
    setDragFrom(null);
    setSelectedPos(null);
    setLegalMoves([]);
  }, [dragFrom, engine, onMove, disabled]);

  const handlePromotion = useCallback((pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (!promotionMove) return;
    const moves = engine.getLegalMoves(promotionMove.from);
    const move = moves.find(m =>
      m.to.row === promotionMove.to.row &&
      m.to.col === promotionMove.to.col &&
      m.promotion === pieceType
    );
    if (move) onMove(move);
    setPromotionMove(null);
  }, [promotionMove, engine, onMove]);

  const isKingInCheck = state.status === 'check' || state.status === 'checkmate';
  const kingPos = isKingInCheck ? findKing(board, engine.getTurn()) : null;

  const rows = flipped ? [0,1,2,3,4,5,6,7] : [0,1,2,3,4,5,6,7];
  const cols = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const displayRows = flipped ? [...rows].reverse() : rows;

  return (
    <>
      <div className="grid grid-cols-8 border-2 border-border rounded-sm overflow-hidden aspect-square w-full max-w-[min(80vh,560px)]">
        {displayRows.map(row =>
          (flipped ? [...cols].reverse() : cols).map(col => {
            const piece = board[row][col];
            const isLight = (row + col) % 2 === 0;
            const isSelected = selectedPos?.row === row && selectedPos?.col === col;
            const isLegal = settings.showLegalMoves && legalMoves.some(m => m.to.row === row && m.to.col === col);
            const isLast = settings.showLastMove && lastMove
              ? (lastMove.from.row === row && lastMove.from.col === col) ||
                (lastMove.to.row === row && lastMove.to.col === col)
              : false;
            const isCheck = isKingInCheck && kingPos?.row === row && kingPos?.col === col;

            const FILES = 'abcdefgh';
            const label = `${FILES[col]}${8 - row}${piece ? ` ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`;

            return (
              <SquareComponent
                key={`${row}-${col}`}
                row={row}
                col={col}
                isLight={isLight}
                isSelected={isSelected}
                isLegalMove={isLegal}
                isLastMove={isLast}
                isCheck={isCheck}
                showCoordinates={settings.showCoordinates}
                theme={settings.boardTheme}
                onClick={() => handleSquareClick(row, col)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, row, col)}
                onDragStart={e => handleDragStart(e, row, col)}
                draggable={!!piece && piece.color === engine.getTurn() && !disabled}
                ariaLabel={label}
              >
                {piece && (
                  <PieceDisplay
                    type={piece.type}
                    color={piece.color}
                    style={settings.pieceStyle}
                    isDragging={dragFrom?.row === row && dragFrom?.col === col}
                  />
                )}
              </SquareComponent>
            );
          })
        )}
      </div>

      {promotionMove && (
        <PromotionDialog
          color={engine.getTurn()}
          pieceStyle={settings.pieceStyle}
          onSelect={handlePromotion}
          onCancel={() => setPromotionMove(null)}
        />
      )}
    </>
  );
}

function findKing(board: any[][], color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) return { row: r, col: c };
    }
  return null;
}
