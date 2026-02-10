import { Move } from '@/engine/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface MoveListProps {
  moves: Move[];
  currentIndex?: number;
  onJumpTo?: (index: number) => void;
}

export function MoveList({ moves, currentIndex, onJumpTo }: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pairs: { num: number; white?: Move; black?: Move; wi: number; bi: number }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      wi: i,
      bi: i + 1,
    });
  }

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <ScrollArea className="h-52 sm:h-72" ref={scrollRef}>
      <div className="p-2 font-mono text-sm tabular-nums">
        {pairs.length === 0 && (
          <p className="text-muted-foreground text-center py-8 text-xs italic">
            No moves yet — make your first move!
          </p>
        )}
        {pairs.map(p => (
          <div
            key={p.num}
            className={cn(
              'flex gap-1 rounded-md px-1 py-[2px] transition-colors',
              p.num % 2 === 0 ? 'bg-muted/40' : ''
            )}
          >
            <span className="w-8 text-muted-foreground text-right shrink-0 select-none">
              {p.num}.
            </span>
            {p.white && (
              <button
                className={cn(
                  'w-16 text-left px-1.5 rounded-md transition-all duration-150',
                  'hover:bg-primary/10 hover:text-primary',
                  currentIndex === p.wi &&
                    'bg-primary/15 text-primary font-semibold ring-1 ring-primary/30'
                )}
                onClick={() => onJumpTo?.(p.wi)}
              >
                {p.white.san}
              </button>
            )}
            {p.black && (
              <button
                className={cn(
                  'w-16 text-left px-1.5 rounded-md transition-all duration-150',
                  'hover:bg-primary/10 hover:text-primary',
                  currentIndex === p.bi &&
                    'bg-primary/15 text-primary font-semibold ring-1 ring-primary/30'
                )}
                onClick={() => onJumpTo?.(p.bi)}
              >
                {p.black.san}
              </button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
