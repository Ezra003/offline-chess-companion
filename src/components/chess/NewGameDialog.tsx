import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NewGameOptions, Difficulty, GameMode, ClockMode, PieceColor } from '@/engine/types';
import { cn } from '@/lib/utils';

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

  const Chip = ({ selected, onClick, children, icon }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:scale-[1.03] active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm glass-strong border-border/50 animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">♟</span> New Game
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
              Mode
            </Label>
            <div className="flex gap-2">
              <Chip selected={mode === 'ai'} onClick={() => setMode('ai')} icon="🤖">vs AI</Chip>
              <Chip selected={mode === 'local'} onClick={() => setMode('local')} icon="👥">Two Player</Chip>
            </div>
          </div>

          {mode === 'ai' && (
            <>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
                  Difficulty
                </Label>
                <div className="flex gap-2">
                  <Chip selected={difficulty === 'easy'} onClick={() => setDifficulty('easy')}>Easy</Chip>
                  <Chip selected={difficulty === 'medium'} onClick={() => setDifficulty('medium')}>Medium</Chip>
                  <Chip selected={difficulty === 'hard'} onClick={() => setDifficulty('hard')}>Hard</Chip>
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
                  Play as
                </Label>
                <div className="flex gap-2">
                  <Chip selected={playerColor === 'w'} onClick={() => setPlayerColor('w')} icon="♔">White</Chip>
                  <Chip selected={playerColor === 'b'} onClick={() => setPlayerColor('b')} icon="♚">Black</Chip>
                  <Chip selected={playerColor === 'random'} onClick={() => setPlayerColor('random')} icon="🎲">Random</Chip>
                </div>
              </div>
            </>
          )}

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
              Clock
            </Label>
            <div className="flex gap-2 flex-wrap">
              <Chip selected={clockMode === 'none'} onClick={() => setClockMode('none')}>No Clock</Chip>
              <Chip selected={clockMode === 'blitz'} onClick={() => setClockMode('blitz')} icon="⚡">3 min</Chip>
              <Chip selected={clockMode === 'rapid'} onClick={() => setClockMode('rapid')} icon="⏱️">10 min</Chip>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleStart}
            className="w-full h-11 text-base font-semibold bg-primary hover:brightness-110 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            Start Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
