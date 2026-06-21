type Subsbcriber = () => void;
type Cleanup = () => void;

export function Subscription() {
  const subscribers = new Set<Subsbcriber>();
  return {
    notify: () => {
      // Snapshot to avoid infinite loops when subscribers are added/removed
      // during notification (e.g. effect re-subscribes on change).
      for (const subscriber of Array.from(subscribers)) {
        subscriber();
      }
    },
    subscribe: (subscriber: Subsbcriber): Cleanup => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
