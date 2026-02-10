import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PieceColor, PieceStyle, PieceType } from '@/engine/types';
import { PieceDisplay } from './PieceDisplay';

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
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Promote Pawn</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-4 py-4">
          {PROMOTIONS.map(p => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-accent transition-colors"
              aria-label={`Promote to ${NAMES[p]}`}
            >
              <PieceDisplay type={p} color={color} style={pieceStyle} />
              <span className="text-xs text-muted-foreground">{NAMES[p]}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
