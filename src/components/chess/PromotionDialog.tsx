import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PieceColor, PieceStyle, PieceType } from '@/engine/types';
import { PieceDisplay } from './PieceDisplay';
import { cn } from '@/lib/utils';

interface PromotionDialogProps {
  color: PieceColor;
  pieceStyle: PieceStyle;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

const PROMOTIONS: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n'];
const NAMES: Record<string, string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

export function PromotionDialog({ color, pieceStyle, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <Dialog open onOpenChange={open => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-xs glass-strong border-border/50 animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">Promote Pawn</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-3 py-4">
          {PROMOTIONS.map((p, i) => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl',
                'transition-all duration-200',
                'hover:bg-primary/10 hover:scale-110 hover:shadow-lg hover:shadow-primary/10',
                'active:scale-95',
                'ring-1 ring-border hover:ring-primary/40',
                'animate-fade-in-up',
              )}
              style={{ animationDelay: `${i * 50}ms` }}
              aria-label={`Promote to ${NAMES[p]}`}
            >
              <PieceDisplay type={p} color={color} style={pieceStyle} />
              <span className="text-[11px] font-medium text-muted-foreground">{NAMES[p]}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
