import { useCallback, useRef } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [getCtx]);

  const playMove = useCallback(() => {
    playTone(600, 0.08, 'sine', 0.12);
    setTimeout(() => playTone(800, 0.06, 'sine', 0.08), 30);
  }, [playTone]);

  const playCapture = useCallback(() => {
    playTone(300, 0.12, 'sawtooth', 0.1);
    setTimeout(() => playTone(500, 0.08, 'square', 0.06), 50);
  }, [playTone]);

  const playCheck = useCallback(() => {
    playTone(880, 0.1, 'square', 0.12);
    setTimeout(() => playTone(660, 0.15, 'square', 0.1), 100);
  }, [playTone]);

  const playGameEnd = useCallback(() => {
    playTone(440, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(330, 0.3, 'sine', 0.12), 150);
    setTimeout(() => playTone(220, 0.4, 'sine', 0.1), 350);
  }, [playTone]);

  return { playMove, playCapture, playCheck, playGameEnd };
}
