import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { GameSettings, BoardTheme, PieceStyle } from '@/engine/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
}

const BOARD_THEMES: { value: BoardTheme; label: string; light: string; dark: string }[] = [
  { value: 'classic', label: 'Classic', light: 'bg-chess-classic-light', dark: 'bg-chess-classic-dark' },
  { value: 'dark', label: 'Dark', light: 'bg-chess-dark-light', dark: 'bg-chess-dark-dark' },
  { value: 'wood', label: 'Wood', light: 'bg-chess-wood-light', dark: 'bg-chess-wood-dark' },
];

export function SettingsPanel({ open, onClose, settings, onChange }: SettingsPanelProps) {
  const update = (partial: Partial<GameSettings>) => onChange({ ...settings, ...partial });

  const Chip = ({ selected, onClick, children }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
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
      {children}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm glass-strong border-border/50 animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-lg">⚙️</span> Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Board Theme with mini preview */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
              Board Theme
            </Label>
            <div className="flex gap-3">
              {BOARD_THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => update({ boardTheme: t.value })}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200',
                    'hover:scale-105 active:scale-95',
                    settings.boardTheme === t.value
                      ? 'ring-2 ring-primary shadow-md shadow-primary/20'
                      : 'ring-1 ring-border hover:ring-primary/40'
                  )}
                >
                  {/* Mini board preview */}
                  <div className="grid grid-cols-4 w-12 h-12 rounded overflow-hidden">
                    {[...Array(16)].map((_, i) => {
                      const row = Math.floor(i / 4);
                      const col = i % 4;
                      const isLight = (row + col) % 2 === 0;
                      return (
                        <div key={i} className={cn('aspect-square', isLight ? t.light : t.dark)} />
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Style */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2.5 block uppercase tracking-wider">
              Piece Style
            </Label>
            <div className="flex gap-2">
              <Chip selected={settings.pieceStyle === 'staunton'} onClick={() => update({ pieceStyle: 'staunton' })}>
                ♔ Staunton
              </Chip>
              <Chip selected={settings.pieceStyle === 'minimal'} onClick={() => update({ pieceStyle: 'minimal' })}>
                K Minimal
              </Chip>
            </div>
          </div>

          {/* Toggle switches */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
              Display
            </Label>
            {([
              ['showLegalMoves', 'Show legal moves', '🎯'],
              ['showLastMove', 'Highlight last move', '✨'],
              ['showCoordinates', 'Show coordinates', '📐'],
              ['highContrast', 'High contrast', '🔲'],
              ['soundEnabled', 'Sound effects', '🔊'],
            ] as [keyof GameSettings, string, string][]).map(([key, label, icon]) => (
              <div key={key} className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                <Label className="text-sm flex items-center gap-2 cursor-pointer">
                  <span className="text-base">{icon}</span> {label}
                </Label>
                <Switch
                  checked={settings[key] as boolean}
                  onCheckedChange={v => update({ [key]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
