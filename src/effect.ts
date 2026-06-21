import { SignalTracker } from "./_internal/consume";

type CleanupFunction = () => void;

export function effect(fn: () => CleanupFunction | void): () => void {
  let effectCleanup: (() => void) | void | undefined;

  const tracker = new SignalTracker(runEffect);

  function runEffect() {
    effectCleanup?.();
    effectCleanup = tracker.track(fn);
  }

  const dispose = () => {
    effectCleanup?.();
    effectCleanup = undefined;
    tracker.dispose();
  };

  try {
    runEffect();
  } catch (error) {
    dispose();
    throw error;
  }

  return dispose;
}
