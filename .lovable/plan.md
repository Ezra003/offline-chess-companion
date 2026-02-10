

# Chess Game — Implementation Plan

## Overview
A fully offline, browser-based chess game with AI opponent, local two-player mode, full rule enforcement, and a polished modern UI. No backend required — everything runs client-side.

---

## Phase 1: Chess Engine (Core Logic)
Build the game engine as a pure TypeScript module, completely independent of React/UI.

- **Board representation** — 8×8 array with piece encoding
- **Legal move generation** — all piece types including sliding pieces, pawns, knights, king
- **Special moves** — castling (king/queenside with all constraints), en passant, pawn promotion
- **Game state** — check detection, checkmate, stalemate, draw by threefold repetition, draw by 50-move rule
- **Move history** — full move list in SAN (Standard Algebraic Notation), undo/redo support
- **FEN support** — generate/parse FEN strings for board state serialization
- **PGN support** — import and export PGN files, reconstruct game state from PGN

## Phase 2: AI Engine
- **Minimax algorithm** with alpha-beta pruning
- **Piece evaluation** — material values + positional tables
- **Three difficulty levels:**
  - Easy (depth 1-2, some randomness)
  - Medium (depth 3)
  - Hard (depth 4+ with better evaluation)
- Runs synchronously or via setTimeout chunks to avoid blocking UI on mobile

## Phase 3: Chessboard UI
- **Board component** — responsive 8×8 grid that scales to viewport
- **Piece rendering** — SVG/Unicode pieces with two style options (Staunton-style, Minimal)
- **Interaction:**
  - Tap-to-select + tap-to-move
  - Drag-and-drop (desktop & touch)
- **Visual highlights:**
  - Legal move dots/circles on valid squares
  - Last move highlight (colored squares)
  - Check warning highlight on king
  - Optional coordinate labels (a–h, 1–8)
- **Pawn promotion dialog** — modal to pick Queen/Rook/Bishop/Knight
- **Three board themes:** Classic (green/cream), Dark (gray tones), Wood (brown tones)

## Phase 4: Game Controls & Side Panel
- **Move list panel** — scrollable list of moves in SAN; click any move to jump to that position
- **Captured pieces** — display taken pieces grouped by color
- **Control buttons:** New Game, Undo, Redo, Resign, Restart
- **Turn indicator** — clear display of whose turn it is
- **Game status banner** — shows check, checkmate, stalemate, draw, resignation

## Phase 5: Game Modes & Setup
- **New Game dialog** with options:
  - Mode: vs AI or Local Two-Player
  - AI difficulty (Easy/Medium/Hard) when vs AI
  - Player color choice (White/Black/Random) when vs AI
  - Clock setting selection
- **Local two-player** — simple pass-and-play with turn indicator

## Phase 6: Timers
- **Clock modes:** No clock, Blitz (3 min), Rapid (10 min), Custom time
- **Dual countdown display** — shows remaining time for each player
- **Time expiration** — automatic loss when clock runs out
- **Pause on game end**

## Phase 7: Settings Panel
- **Board theme** — Classic / Dark / Wood
- **Piece style** — Staunton / Minimal
- **Sound toggle** — move sounds, capture sounds, check sounds
- **Highlight toggles** — legal moves, last move, coordinates
- **High-contrast mode** — accessibility toggle
- Settings persisted to localStorage

## Phase 8: File Handling & Persistence
- **PGN export** — download current game as .pgn file
- **PGN import** — upload/paste PGN to reconstruct game
- **Auto-save** — current game saved to localStorage automatically
- **Game list** — resume previous saved games from a simple list

## Phase 9: Accessibility
- **Keyboard navigation** — arrow keys to move selection, Enter to confirm
- **Screen reader labels** — ARIA labels on all squares and pieces (e.g., "White Knight on g1")
- **High-contrast mode** — toggle for visually distinct board colors
- **Focus indicators** — visible focus ring on selected square

## Phase 10: Responsive Layout
- **Desktop** — board on left, side panel (moves + controls) on right
- **Tablet** — board fills width, panel below
- **Mobile** — full-width board with collapsible bottom panel for moves/controls
- Touch-friendly button sizes throughout

---

## Component Architecture
- `ChessEngine` — pure logic module (no React)
- `AIEngine` — minimax with alpha-beta pruning
- `Board` → `Square` → `Piece` — rendering hierarchy
- `MoveList` — interactive move history
- `CapturedPieces` — taken pieces display
- `GameControls` — action buttons
- `ChessTimer` — dual clock display
- `SettingsPanel` — preferences dialog
- `NewGameDialog` — game setup
- `PromotionDialog` — piece selection
- `PGNDialog` — import/export interface

