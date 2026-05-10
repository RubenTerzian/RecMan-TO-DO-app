import { useCallback, useEffect, useRef } from "react";

export function useRafThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
) {
  const callbackRef = useRef(callback);
  const frameIdRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (frameIdRef.current === null) {
        return;
      }

      window.cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  const cancel = useCallback(() => {
    if (frameIdRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(frameIdRef.current);
    frameIdRef.current = null;
    lastArgsRef.current = null;
  }, []);

  const schedule = useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;

    if (frameIdRef.current !== null) {
      return;
    }

    frameIdRef.current = window.requestAnimationFrame(() => {
      frameIdRef.current = null;

      if (!lastArgsRef.current) {
        return;
      }

      const nextArgs = lastArgsRef.current;
      lastArgsRef.current = null;
      callbackRef.current(...nextArgs);
    });
  }, []);

  return {
    schedule,
    cancel,
  };
}
