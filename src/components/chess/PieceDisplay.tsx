import { PieceType, PieceColor, PieceStyle } from '@/engine/types';

const STAUNTON: Record<string, string> = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

const MINIMAL: Record<string, string> = {
  wp: 'P', wn: 'N', wb: 'B', wr: 'R', wq: 'Q', wk: 'K',
  bp: 'p', bn: 'n', bb: 'b', br: 'r', bq: 'q', bk: 'k',
};

interface PieceDisplayProps {
  type: PieceType;
  color: PieceColor;
  style: PieceStyle;
  isDragging?: boolean;
}

export function PieceDisplay({ type, color, style, isDragging }: PieceDisplayProps) {
  const key = `${color}${type}`;
  const symbol = style === 'staunton' ? STAUNTON[key] : MINIMAL[key];

  return (
    <span
      className={`select-none text-3xl sm:text-4xl leading-none transition-transform ${
        isDragging ? 'scale-110 opacity-70' : ''
      } ${color === 'w' ? 'text-chess-white-piece' : 'text-chess-black-piece'}`}
      style={{ filter: color === 'w' && style === 'staunton' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' : undefined }}
    >
      {symbol}
    </span>
  );
}
