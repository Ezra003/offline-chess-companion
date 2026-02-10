import { Move } from '@/engine/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MoveListProps {
  moves: Move[];
  currentIndex?: number;
  onJumpTo?: (index: number) => void;
}

export function MoveList({ moves, currentIndex, onJumpTo }: MoveListProps) {
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

  return (
    <ScrollArea className="h-48 sm:h-64">
      <div className="space-y-0.5 p-2 font-mono text-sm">
        {pairs.length === 0 && (
          <p className="text-muted-foreground text-center py-4 text-xs">No moves yet</p>
        )}
        {pairs.map(p => (
          <div key={p.num} className="flex gap-1">
            <span className="w-8 text-muted-foreground text-right shrink-0">{p.num}.</span>
            {p.white && (
              <button
                className={cn(
                  'w-16 text-left px-1 rounded hover:bg-accent',
                  currentIndex === p.wi && 'bg-primary/20 font-bold'
                )}
                onClick={() => onJumpTo?.(p.wi)}
              >
                {p.white.san}
              </button>
            )}
            {p.black && (
              <button
                className={cn(
                  'w-16 text-left px-1 rounded hover:bg-accent',
                  currentIndex === p.bi && 'bg-primary/20 font-bold'
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
