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
  isNew?: boolean;
}

export function PieceDisplay({ type, color, style, isDragging, isNew }: PieceDisplayProps) {
  const key = `${color}${type}`;
  const symbol = style === 'staunton' ? STAUNTON[key] : MINIMAL[key];

  const isWhite = color === 'w';

  return (
    <span
      className={[
        'select-none leading-none z-10',
        // Size
        'text-[clamp(1.8rem,5.5vw,2.8rem)]',
        // Color with shadows for depth
        isWhite ? 'text-chess-white-piece' : 'text-chess-black-piece',
        // Transition
        'transition-all duration-200 ease-out',
        // Drag state
        isDragging ? 'scale-125 opacity-60 rotate-3' : '',
        // Hover micro-interaction
        !isDragging ? 'hover:scale-110 hover:-translate-y-[2px]' : '',
        // Entrance animation
        isNew ? 'animate-piece-appear' : '',
      ].join(' ')}
      style={{
        filter: isWhite && style === 'staunton'
          ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.35)) drop-shadow(0 0 1px rgba(0,0,0,0.2))'
          : !isWhite && style === 'staunton'
            ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'
            : undefined,
        cursor: 'grab',
      }}
    >
      {symbol}
    </span>
  );
}
