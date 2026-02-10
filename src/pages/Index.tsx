import { useState, useCallback, useEffect, useMemo } from 'react';
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
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/utils';

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
  const { playMove, playCapture, playCheck, playGameEnd } = useSound();
  const [engine, setEngine] = useState(() => new ChessEngine());
  const [gameState, setGameState] = useState(() => engine.getState());

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

  const updateGameState = useCallback(() => {
    setGameState(engine.getState());
  }, [engine]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('chess-settings', JSON.stringify(settings));
  }, [settings]);

  // Sound effects
  const prevMoveCount = useMemo(() => gameState.moveHistory.length, [gameState.moveHistory.length]);
  useEffect(() => {
    if (!settings.soundEnabled || prevMoveCount === 0) return;
    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    if (!lastMove) return;

    if (engine.isGameOver()) {
      playGameEnd();
    } else if (gameState.status === 'check') {
      playCheck();
    } else if (lastMove.captured) {
      playCapture();
    } else {
      playMove();
    }
  }, [prevMoveCount]);

  // AI move
  const engineTurn = engine.getTurn();
  const isGameOver = engine.isGameOver();
  useEffect(() => {
    if (gameMode !== 'ai' || isGameOver) return;
    if (engineTurn !== playerColor && !aiThinking) {
      setAiThinking(true);
      setTimeout(() => {
        const move = getAIMove(engine, difficulty);
        if (move) {
          engine.makeMove(move);
          updateGameState();
        }
        setAiThinking(false);
      }, 200);
    }
  }, [engineTurn, gameMode, playerColor, isGameOver, aiThinking, difficulty, engine, updateGameState]);

  const handleMove = useCallback((move: Move) => {
    engine.makeMove(move);
    updateGameState();
  }, [engine, updateGameState]);

  const handleNewGame = useCallback((options: NewGameOptions) => {
    let color = options.playerColor;
    if (color === 'random') color = Math.random() < 0.5 ? 'w' : 'b';
    setGameMode(options.mode);
    setDifficulty(options.difficulty);
    setPlayerColor(color);
    setClockMode(options.clockMode);
    engine.reset();
    setResetKey(k => k + 1);
    updateGameState();
  }, [engine, updateGameState]);

  const handleUndo = useCallback(() => {
    engine.undo();
    if (gameMode === 'ai') engine.undo();
    updateGameState();
  }, [engine, gameMode, updateGameState]);

  const handleRedo = useCallback(() => {
    engine.redo();
    if (gameMode === 'ai') engine.redo();
    updateGameState();
  }, [engine, gameMode, updateGameState]);

  const handleResign = useCallback(() => {
    engine.resign();
    updateGameState();
  }, [engine, updateGameState]);

  const handleRestart = useCallback(() => {
    engine.reset();
    setResetKey(k => k + 1);
    updateGameState();
  }, [engine, updateGameState]);

  const handleTimeout = useCallback((color: PieceColor) => {
    engine.timeout(color);
    updateGameState();
  }, [engine, updateGameState]);

  const handlePGNImport = useCallback((pgn: string) => {
    const ok = engine.loadPGN(pgn);
    if (ok) {
      setGameMode('local');
      updateGameState();
      toast({ title: 'PGN loaded successfully' });
    } else {
      toast({ title: 'Failed to load PGN', variant: 'destructive' });
    }
  }, [engine, updateGameState, toast]);

  const isPlayerTurn = gameMode === 'local' || engine.getTurn() === playerColor;
  const state = gameState;

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

  const statusStyle = useMemo(() => {
    if (engine.isGameOver()) return 'bg-red-500/15 text-red-500 dark:text-red-400 ring-red-500/20';
    if (state.status === 'check') return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-orange-500/20';
    return 'bg-primary/10 text-primary ring-primary/15';
  }, [state.status, engine]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/60">
        <div className="gradient-accent h-[2px]" />
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-2xl">♟</span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Chess
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPGN(true)}
              className="h-9 w-9 p-0 hover:scale-105 transition-transform"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Board section */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <ChessTimer
            clockMode={clockMode}
            activeTurn={engine.getTurn()}
            gameOver={engine.isGameOver()}
            onTimeout={handleTimeout}
            resetKey={resetKey}
          />

          {/* Status pill */}
          <div className={cn(
            'text-sm font-semibold px-4 py-1.5 rounded-full ring-1 transition-all duration-300',
            statusStyle,
          )}>
            {statusText}
            {aiThinking && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="animate-thinking">●</span>
                <span className="text-muted-foreground font-normal">thinking</span>
              </span>
            )}
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
        <div className="flex flex-col gap-4 lg:w-80 w-full animate-fade-in-up">
          {/* Captured pieces card */}
          <div className="glass rounded-xl border border-border/60 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Material
            </h3>
            <CapturedPieces moves={state.moveHistory} pieceStyle={settings.pieceStyle} />
          </div>

          {/* Move list card */}
          <div className="glass rounded-xl border border-border/60 overflow-hidden flex-1">
            <div className="px-4 py-2.5 border-b border-border/60">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Moves
              </h3>
            </div>
            <MoveList moves={state.moveHistory} currentIndex={state.moveHistory.length - 1} />
          </div>

          {/* Controls */}
          <div className="glass rounded-xl border border-border/60 p-3">
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
