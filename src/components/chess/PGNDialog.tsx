import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PGNDialogProps {
  open: boolean;
  onClose: () => void;
  pgn: string;
  onImport: (pgn: string) => void;
}

export function PGNDialog({ open, onClose, pgn, onImport }: PGNDialogProps) {
  const [importText, setImportText] = useState('');
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.pgn';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pgn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleImport = () => {
    onImport(importText);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md glass-strong border-border/50 animate-fade-in-up">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="text-lg">📋</span> PGN
          </DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setTab('export')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              tab === 'export'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setTab('import')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
              tab === 'import'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
        </div>

        {tab === 'export' ? (
          <>
            <div className="relative">
              <Textarea
                value={pgn}
                readOnly
                className="font-mono text-xs h-40 bg-muted/50 border-border/50 resize-none"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-7 w-7 p-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <DialogFooter>
              <Button
                onClick={handleExport}
                className="w-full h-10 bg-primary hover:brightness-110 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4 mr-2" /> Download .pgn
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste PGN notation here..."
              className="font-mono text-xs h-40 bg-muted/50 border-border/50 resize-none"
            />
            <DialogFooter>
              <Button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full h-10 bg-primary hover:brightness-110 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="h-4 w-4 mr-2" /> Load Game
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
