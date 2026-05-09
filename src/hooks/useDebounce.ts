import { useCallback, useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => void>(
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

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs],
  );
}
