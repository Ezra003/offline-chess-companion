import { useEffect, useRef, useState } from 'react';
import { PieceColor, ClockMode } from '@/engine/types';
import { cn } from '@/lib/utils';

interface ChessTimerProps {
  clockMode: ClockMode;
  activeTurn: PieceColor;
  gameOver: boolean;
  onTimeout: (color: PieceColor) => void;
  resetKey: number;
}

function getInitialTime(mode: ClockMode): number {
  switch (mode) {
    case 'blitz': return 180;
    case 'rapid': return 600;
    default: return 0;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ChessTimer({ clockMode, activeTurn, gameOver, onTimeout, resetKey }: ChessTimerProps) {
  const initialTime = getInitialTime(clockMode);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setWhiteTime(getInitialTime(clockMode));
    setBlackTime(getInitialTime(clockMode));
  }, [clockMode, resetKey]);

  useEffect(() => {
    if (clockMode === 'none' || gameOver) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (activeTurn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) { onTimeout('w'); return 0; }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) { onTimeout('b'); return 0; }
          return prev - 1;
        });
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTurn, clockMode, gameOver, onTimeout]);

  if (clockMode === 'none') return null;

  const isWhiteLow = whiteTime <= 30;
  const isBlackLow = blackTime <= 30;

  return (
    <div className="flex justify-between gap-3">
      {/* Black timer */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-all duration-300',
        activeTurn === 'b'
          ? 'bg-foreground text-background shadow-lg scale-105'
          : 'bg-muted text-muted-foreground',
        isBlackLow && activeTurn === 'b' && 'animate-timer-warn'
      )}>
        <span className="text-xl">♚</span>
        <span className="tracking-wider">{formatTime(blackTime)}</span>
      </div>
      {/* White timer */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-all duration-300',
        activeTurn === 'w'
          ? 'bg-foreground text-background shadow-lg scale-105'
          : 'bg-muted text-muted-foreground',
        isWhiteLow && activeTurn === 'w' && 'animate-timer-warn'
      )}>
        <span className="text-xl">♔</span>
        <span className="tracking-wider">{formatTime(whiteTime)}</span>
      </div>
    </div>
  );
}
