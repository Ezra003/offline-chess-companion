import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload } from 'lucide-react';

interface PGNDialogProps {
  open: boolean;
  onClose: () => void;
  pgn: string;
  onImport: (pgn: string) => void;
}

export function PGNDialog({ open, onClose, pgn, onImport }: PGNDialogProps) {
  const [importText, setImportText] = useState('');
  const [tab, setTab] = useState<'export' | 'import'>('export');

  const handleExport = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game.pgn';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    onImport(importText);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>PGN</DialogTitle></DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant={tab === 'export' ? 'default' : 'outline'} onClick={() => setTab('export')}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" variant={tab === 'import' ? 'default' : 'outline'} onClick={() => setTab('import')}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
        </div>
        {tab === 'export' ? (
          <>
            <Textarea value={pgn} readOnly className="font-mono text-xs h-40" />
            <DialogFooter>
              <Button onClick={handleExport}>Download .pgn</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste PGN here..."
              className="font-mono text-xs h-40"
            />
            <DialogFooter>
              <Button onClick={handleImport} disabled={!importText.trim()}>Load Game</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
