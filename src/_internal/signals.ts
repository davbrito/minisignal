import type { Signal } from "../signal";
import { SignalTracker } from "./consume";
import { SignalValue } from "./value";

const derivedRegistry = new FinalizationRegistry<() => void>((disposeTracker) =>
  disposeTracker(),
);

export class DerivedSignal<T> extends SignalValue<T> implements Signal<T> {
  #fn: () => T;

  constructor(fn: () => T) {
    super();
    const tracker = new SignalTracker((): void => {
      super.value = tracker.track(this.#fn);
    });
    super.value = tracker.track(fn);
    this.#fn = fn;

    // When this instance is garbage-collected, dispose the tracker
    // to break the reference chain.
    derivedRegistry.register(this, () => tracker.dispose());
  }

  get value() {
    return super.value;
  }

  set value(_v: T) {
    throw new Error("Can't set the value of a derived signal");
  }
}
