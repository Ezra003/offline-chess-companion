import { Piece, PieceColor, PieceType, PieceStyle } from '@/engine/types';
import { PieceDisplay } from './PieceDisplay';

interface CapturedPiecesProps {
  moves: { captured?: Piece }[];
  pieceStyle: PieceStyle;
}

const ORDER: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
const VALUES: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function CapturedPieces({ moves, pieceStyle }: CapturedPiecesProps) {
  const captured: Record<PieceColor, PieceType[]> = { w: [], b: [] };

  for (const m of moves) {
    if (m.captured) captured[m.captured.color].push(m.captured.type);
  }

  const sortPieces = (pieces: PieceType[]) =>
    [...pieces].sort((a, b) => VALUES[b] - VALUES[a]);

  const whiteAdv = captured.b.reduce((s, p) => s + VALUES[p], 0) -
    captured.w.reduce((s, p) => s + VALUES[p], 0);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-0.5 flex-wrap min-h-[28px]">
        {sortPieces(captured.b).map((p, i) => (
          <span key={i} className="text-lg leading-none"><PieceDisplay type={p} color="b" style={pieceStyle} /></span>
        ))}
        {whiteAdv > 0 && <span className="text-xs text-muted-foreground ml-1">+{whiteAdv}</span>}
      </div>
      <div className="flex items-center gap-0.5 flex-wrap min-h-[28px]">
        {sortPieces(captured.w).map((p, i) => (
          <span key={i} className="text-lg leading-none"><PieceDisplay type={p} color="w" style={pieceStyle} /></span>
        ))}
        {whiteAdv < 0 && <span className="text-xs text-muted-foreground ml-1">+{-whiteAdv}</span>}
      </div>
    </div>
  );
}
