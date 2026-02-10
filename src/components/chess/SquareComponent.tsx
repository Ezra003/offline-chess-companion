import { cn } from '@/lib/utils';
import { BoardTheme } from '@/engine/types';

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
        'relative flex items-center justify-center aspect-square cursor-pointer',
        'transition-all duration-150 ease-out',
        baseBg,
        // Hover effect: subtle brightness boost
        !isSelected && !isCheck && 'hover:brightness-110',
        // Selected square: warm golden highlight
        isSelected && 'ring-[3px] ring-inset ring-amber-400 brightness-125',
        // Last move highlight: soft amber wash
        isLastMove && !isSelected && 'brightness-115',
        // Check: red pulse glow
        isCheck && 'animate-check-pulse bg-red-500/40',
      )}
      style={{
        // Subtle gradient overlay for depth on each square
        backgroundImage: isLight
          ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%)'
          : 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.06) 100%)',
        ...(isLastMove && !isSelected ? {
          boxShadow: `inset 0 0 0 2px rgba(234, 179, 8, 0.35)`,
        } : {}),
      }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragStart={onDragStart}
      draggable={draggable}
      role="gridcell"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {/* Legal move dot (empty square) */}
      {isLegalMove && !children && (
        <div className="w-[28%] h-[28%] rounded-full bg-black/20 dark:bg-white/20 animate-dot-pulse" />
      )}
      {/* Legal move ring (capture target) */}
      {isLegalMove && children && (
        <div className="absolute inset-[3px] rounded-full ring-[3px] ring-inset ring-black/25 dark:ring-white/25 pointer-events-none" />
      )}
      {children}
      {/* File/rank coordinates */}
      {showCoordinates && col === 0 && (
        <span className={cn(
          'absolute top-[2px] left-[3px] text-[9px] font-semibold pointer-events-none leading-none',
          isLight ? 'text-chess-classic-dark/60' : 'text-chess-classic-light/50'
        )}>
          {8 - row}
        </span>
      )}
      {showCoordinates && row === 7 && (
        <span className={cn(
          'absolute bottom-[1px] right-[3px] text-[9px] font-semibold pointer-events-none leading-none',
          isLight ? 'text-chess-classic-dark/60' : 'text-chess-classic-light/50'
        )}>
          {FILES[col]}
        </span>
      )}
    </div>
  );
}
