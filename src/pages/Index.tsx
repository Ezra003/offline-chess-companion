import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ChessEngine } from '@/engine/ChessEngine';
import { getAIMove } from '@/engine/AIEngine';
import {
  Move, GameSettings, NewGameOptions, ClockMode, PieceColor, Difficulty, GameMode,
} from '@/engine/types';
import { Board } from '@/components/chess/Board';
import { MoveList } from '@/components/chess/MoveList';
import { CapturedPieces } from '@/components/chess/CapturedPieces';
import { GameControls } from '@/components/chess/GameControls';
import { ChessTimer } from '@/components/chess/ChessTimer';
import { NewGameDialog } from '@/components/chess/NewGameDialog';
import { SettingsPanel } from '@/components/chess/SettingsPanel';
import { PGNDialog } from '@/components/chess/PGNDialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'classic',
  pieceStyle: 'staunton',
  soundEnabled: true,
  showLegalMoves: true,
  showLastMove: true,
  showCoordinates: true,
  highContrast: false,
};

function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem('chess-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

const Index = () => {
  const { toast } = useToast();
  const [engine] = useState(() => new ChessEngine());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [showNewGame, setShowNewGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPGN, setShowPGN] = useState(false);

  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [clockMode, setClockMode] = useState<ClockMode>('none');
  const [resetKey, setResetKey] = useState(0);
  const [aiThinking, setAiThinking] = useState(false);

  const flipped = playerColor === 'b' && gameMode === 'ai';

  // Save settings
  useEffect(() => {
    localStorage.setItem('chess-settings', JSON.stringify(settings));
  }, [settings]);

  // AI move
  useEffect(() => {
    if (gameMode !== 'ai' || engine.isGameOver()) return;
    if (engine.getTurn() !== playerColor && !aiThinking) {
      setAiThinking(true);
      setTimeout(() => {
        const move = getAIMove(engine, difficulty);
        if (move) {
          engine.makeMove(move);
          forceUpdate();
        }
        setAiThinking(false);
      }, 200);
    }
  }, [engine.getTurn(), gameMode, playerColor, engine.isGameOver()]);

  const handleMove = useCallback((move: Move) => {
    engine.makeMove(move);
    forceUpdate();
  }, [engine, forceUpdate]);

  const handleNewGame = useCallback((options: NewGameOptions) => {
    let color = options.playerColor;
    if (color === 'random') color = Math.random() < 0.5 ? 'w' : 'b';
    setGameMode(options.mode);
    setDifficulty(options.difficulty);
    setPlayerColor(color);
    setClockMode(options.clockMode);
    engine.reset();
    setResetKey(k => k + 1);
    forceUpdate();
  }, [engine, forceUpdate]);

  const handleUndo = useCallback(() => {
    engine.undo();
    if (gameMode === 'ai') engine.undo(); // undo AI move too
    forceUpdate();
  }, [engine, gameMode, forceUpdate]);

  const handleRedo = useCallback(() => {
    engine.redo();
    if (gameMode === 'ai') engine.redo();
    forceUpdate();
  }, [engine, gameMode, forceUpdate]);

  const handleResign = useCallback(() => {
    engine.resign();
    forceUpdate();
  }, [engine, forceUpdate]);

  const handleRestart = useCallback(() => {
    engine.reset();
    setResetKey(k => k + 1);
    forceUpdate();
  }, [engine, forceUpdate]);

  const handleTimeout = useCallback((color: PieceColor) => {
    engine.timeout(color);
    forceUpdate();
  }, [engine, forceUpdate]);

  const handlePGNImport = useCallback((pgn: string) => {
    const ok = engine.loadPGN(pgn);
    if (ok) {
      setGameMode('local');
      forceUpdate();
      toast({ title: 'PGN loaded successfully' });
    } else {
      toast({ title: 'Failed to load PGN', variant: 'destructive' });
    }
  }, [engine, forceUpdate, toast]);

  const isPlayerTurn = gameMode === 'local' || engine.getTurn() === playerColor;
  const state = engine.getState();

  const statusText = useMemo(() => {
    switch (state.status) {
      case 'checkmate': return `Checkmate! ${state.turn === 'w' ? 'Black' : 'White'} wins`;
      case 'stalemate': return 'Stalemate — Draw';
      case 'draw_repetition': return 'Draw by repetition';
      case 'draw_50move': return 'Draw by 50-move rule';
      case 'resigned': return `${state.turn === 'w' ? 'White' : 'Black'} resigned`;
      case 'timeout': return `${state.turn === 'w' ? 'White' : 'Black'} ran out of time`;
      case 'check': return `${state.turn === 'w' ? 'White' : 'Black'} is in check`;
      default: return `${state.turn === 'w' ? 'White' : 'Black'} to move`;
    }
  }, [state.status, state.turn]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">♟ Chess</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowPGN(true)}>
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Board section */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <ChessTimer
            clockMode={clockMode}
            activeTurn={engine.getTurn()}
            gameOver={engine.isGameOver()}
            onTimeout={handleTimeout}
            resetKey={resetKey}
          />

          {/* Status */}
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            engine.isGameOver()
              ? 'bg-destructive/10 text-destructive'
              : state.status === 'check'
              ? 'bg-orange-500/10 text-orange-600'
              : 'bg-secondary text-secondary-foreground'
          }`}>
            {statusText}
            {aiThinking && ' • AI thinking...'}
          </div>

          <Board
            engine={engine}
            settings={settings}
            flipped={flipped}
            onMove={handleMove}
            disabled={!isPlayerTurn || engine.isGameOver() || aiThinking}
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 lg:w-72 w-full">
          <CapturedPieces moves={state.moveHistory} pieceStyle={settings.pieceStyle} />
          <div className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground">Moves</span>
            </div>
            <MoveList moves={state.moveHistory} currentIndex={state.moveHistory.length - 1} />
          </div>
          <GameControls
            onNewGame={() => setShowNewGame(true)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onResign={handleResign}
            onRestart={handleRestart}
            onSettings={() => setShowSettings(true)}
            canUndo={engine.canUndo()}
            canRedo={engine.canRedo()}
            gameOver={engine.isGameOver()}
          />
        </div>
      </main>

      {/* Dialogs */}
      <NewGameDialog open={showNewGame} onClose={() => setShowNewGame(false)} onStart={handleNewGame} />
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onChange={setSettings} />
      <PGNDialog open={showPGN} onClose={() => setShowPGN(false)} pgn={engine.toPGN()} onImport={handlePGNImport} />
    </div>
  );
};

export default Index;
