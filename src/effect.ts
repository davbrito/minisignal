import { consume } from "./_internal/consume";
import type { Signal } from "./signal";

type CleanupFunction = () => void;

export function effect(fn: () => CleanupFunction | void): () => void {
  let cleanup: (() => void) | void | undefined;
  let unsubscribe: (() => void) | undefined;

  const runEffect = () => {
    cleanup?.();
    let signals: ReadonlySet<Signal<unknown>>;

    [cleanup, signals] = consume(fn);

    const unsubscribes = Array.from(signals, (signal) =>
      signal.subscribe(runEffect),
    );

    unsubscribe = () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  };

  const dispose = () => {
    unsubscribe?.();
    unsubscribe = undefined;
    cleanup?.();
    cleanup = undefined;
  };

  try {
    runEffect();
  } catch (error) {
    dispose();
    throw error;
  }

  return dispose;
}
