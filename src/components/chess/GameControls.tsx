import { Button } from '@/components/ui/button';
import { RotateCcw, Undo2, Redo2, Flag, Plus, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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

function ControlButton({
  onClick, disabled, tooltip, children, variant = 'outline',
}: {
  onClick: () => void;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  variant?: 'outline' | 'ghost' | 'default';
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={variant}
            onClick={onClick}
            disabled={disabled}
            className="h-9 w-9 p-0 transition-all duration-150 hover:scale-105 active:scale-95"
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function GameControls({
  onNewGame, onUndo, onRedo, onResign, onRestart, onSettings,
  canUndo, canRedo, gameOver,
}: GameControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Primary action */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={onNewGame}
              className="h-9 px-3 gap-1.5 bg-primary text-primary-foreground hover:brightness-110 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4" /> New
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">New Game</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Undo / Redo group */}
      <div className="flex items-center rounded-lg border border-border overflow-hidden">
        <Button
          size="sm"
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-9 w-9 p-0 rounded-none border-r border-border hover:bg-muted transition-all duration-150"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-9 w-9 p-0 rounded-none hover:bg-muted transition-all duration-150"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {!gameOver && (
        <ControlButton onClick={onResign} tooltip="Resign">
          <Flag className="h-4 w-4" />
        </ControlButton>
      )}
      <ControlButton onClick={onRestart} tooltip="Restart">
        <RotateCcw className="h-4 w-4" />
      </ControlButton>
      <ControlButton onClick={onSettings} tooltip="Settings" variant="ghost">
        <Settings className="h-4 w-4" />
      </ControlButton>
    </div>
  );
}
