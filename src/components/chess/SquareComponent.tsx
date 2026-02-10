import { cn } from '@/lib/utils';
import { Position, BoardTheme } from '@/engine/types';

interface SquareProps {
  row: number;
  col: number;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  showCoordinates: boolean;
  theme: BoardTheme;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children?: React.ReactNode;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
  ariaLabel?: string;
}

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string }> = {
  classic: { light: 'bg-chess-classic-light', dark: 'bg-chess-classic-dark' },
  dark: { light: 'bg-chess-dark-light', dark: 'bg-chess-dark-dark' },
  wood: { light: 'bg-chess-wood-light', dark: 'bg-chess-wood-dark' },
};

const FILES = 'abcdefgh';

export function SquareComponent({
  row, col, isLight, isSelected, isLegalMove, isLastMove, isCheck,
  showCoordinates, theme, onClick, onDragOver, onDrop, children,
  onDragStart, draggable, ariaLabel,
}: SquareProps) {
  const colors = THEME_COLORS[theme];
  const baseBg = isLight ? colors.light : colors.dark;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center aspect-square cursor-pointer transition-colors',
        baseBg,
        isSelected && 'ring-2 ring-inset ring-yellow-400 bg-yellow-300/40',
        isLastMove && !isSelected && 'bg-amber-300/30',
        isCheck && 'bg-red-500/50 ring-2 ring-red-500',
      )}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragStart={onDragStart}
      draggable={draggable}
      role="gridcell"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {isLegalMove && !children && (
        <div className="w-3 h-3 rounded-full bg-black/20" />
      )}
      {isLegalMove && children && (
        <div className="absolute inset-0 ring-4 ring-inset ring-black/20 rounded-none pointer-events-none" />
      )}
      {children}
      {showCoordinates && col === 0 && (
        <span className={cn(
          'absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none',
          isLight ? 'text-chess-classic-dark/70' : 'text-chess-classic-light/70'
        )}>
          {8 - row}
        </span>
      )}
      {showCoordinates && row === 7 && (
        <span className={cn(
          'absolute bottom-0 right-1 text-[10px] font-bold pointer-events-none',
          isLight ? 'text-chess-classic-dark/70' : 'text-chess-classic-light/70'
        )}>
          {FILES[col]}
        </span>
      )}
    </div>
  );
}
