import { Button } from '@/components/ui/button';
import { RotateCcw, Undo2, Redo2, Flag, RefreshCw, Settings } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onResign: () => void;
  onRestart: () => void;
  onSettings: () => void;
  canUndo: boolean;
  canRedo: boolean;
  gameOver: boolean;
}

export function GameControls({
  onNewGame, onUndo, onRedo, onResign, onRestart, onSettings,
  canUndo, canRedo, gameOver,
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={onNewGame}>
        <RefreshCw className="h-4 w-4 mr-1" /> New
      </Button>
      <Button size="sm" variant="outline" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="h-4 w-4" />
      </Button>
      {!gameOver && (
        <Button size="sm" variant="outline" onClick={onResign}>
          <Flag className="h-4 w-4 mr-1" /> Resign
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={onRestart}>
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onSettings}>
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
