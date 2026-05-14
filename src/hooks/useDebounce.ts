import { useCallback, useEffect, useRef } from "react";

/**
 * Generic callable constraint. `never[]` is the contravariant
 * "any tuple of args" — it accepts any concrete callback shape via
 * `Parameters<T>` while satisfying `@typescript-eslint/no-explicit-any`.
 */
type AnyCallback = (...args: never[]) => void;

export function useDebounce<T extends AnyCallback>(
  callback: T,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timeoutIdRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = null;
  }, []);

  const schedule = useCallback(
    (...args: Parameters<T>) => {
      cancel();

      timeoutIdRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timeoutIdRef.current = null;
      }, delayMs);
    },
    [cancel, delayMs],
  );

  return {
    schedule,
    cancel,
  };
}
