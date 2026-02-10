import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NewGameOptions, Difficulty, GameMode, ClockMode, PieceColor } from '@/engine/types';

interface NewGameDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (options: NewGameOptions) => void;
}

export function NewGameDialog({ open, onClose, onStart }: NewGameDialogProps) {
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor | 'random'>('w');
  const [clockMode, setClockMode] = useState<ClockMode>('none');

  const handleStart = () => {
    onStart({ mode, difficulty, playerColor, clockMode });
    onClose();
  };

  const Chip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Game</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Mode</Label>
            <div className="flex gap-2">
              <Chip selected={mode === 'ai'} onClick={() => setMode('ai')}>vs AI</Chip>
              <Chip selected={mode === 'local'} onClick={() => setMode('local')}>Two Player</Chip>
            </div>
          </div>

          {mode === 'ai' && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Difficulty</Label>
                <div className="flex gap-2">
                  <Chip selected={difficulty === 'easy'} onClick={() => setDifficulty('easy')}>Easy</Chip>
                  <Chip selected={difficulty === 'medium'} onClick={() => setDifficulty('medium')}>Medium</Chip>
                  <Chip selected={difficulty === 'hard'} onClick={() => setDifficulty('hard')}>Hard</Chip>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Play as</Label>
                <div className="flex gap-2">
                  <Chip selected={playerColor === 'w'} onClick={() => setPlayerColor('w')}>White</Chip>
                  <Chip selected={playerColor === 'b'} onClick={() => setPlayerColor('b')}>Black</Chip>
                  <Chip selected={playerColor === 'random'} onClick={() => setPlayerColor('random')}>Random</Chip>
                </div>
              </div>
            </>
          )}

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Clock</Label>
            <div className="flex gap-2 flex-wrap">
              <Chip selected={clockMode === 'none'} onClick={() => setClockMode('none')}>No Clock</Chip>
              <Chip selected={clockMode === 'blitz'} onClick={() => setClockMode('blitz')}>3 min</Chip>
              <Chip selected={clockMode === 'rapid'} onClick={() => setClockMode('rapid')}>10 min</Chip>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleStart} className="w-full">Start Game</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
