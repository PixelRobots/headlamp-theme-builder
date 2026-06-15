import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;

export interface UndoRedoControls<T> {
  state: T;
  set: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo<T>(initial: T): UndoRedoControls<T> {
  // past[0] is oldest, past[past.length-1] is most recent before current
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const [current, setCurrent] = useState<T>(initial);

  const set = useCallback((next: T) => {
    pastRef.current = [...pastRef.current, current].slice(-MAX_HISTORY);
    futureRef.current = [];
    setCurrent(next);
  }, [current]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [current, ...futureRef.current];
    setCurrent(prev);
  }, [current]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, current];
    setCurrent(next);
  }, [current]);

  return {
    state: current,
    set,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
