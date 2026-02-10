import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { GameSettings, BoardTheme, PieceStyle } from '@/engine/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
}

export function SettingsPanel({ open, onClose, settings, onChange }: SettingsPanelProps) {
  const update = (partial: Partial<GameSettings>) => onChange({ ...settings, ...partial });

  const Chip = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Board Theme</Label>
            <div className="flex gap-2">
              {(['classic', 'dark', 'wood'] as BoardTheme[]).map(t => (
                <Chip key={t} selected={settings.boardTheme === t} onClick={() => update({ boardTheme: t })}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Piece Style</Label>
            <div className="flex gap-2">
              <Chip selected={settings.pieceStyle === 'staunton'} onClick={() => update({ pieceStyle: 'staunton' })}>Staunton</Chip>
              <Chip selected={settings.pieceStyle === 'minimal'} onClick={() => update({ pieceStyle: 'minimal' })}>Minimal</Chip>
            </div>
          </div>
          <div className="space-y-3">
            {([
              ['showLegalMoves', 'Show legal moves'],
              ['showLastMove', 'Highlight last move'],
              ['showCoordinates', 'Show coordinates'],
              ['highContrast', 'High contrast'],
              ['soundEnabled', 'Sound effects'],
            ] as [keyof GameSettings, string][]).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
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
