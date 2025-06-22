type Subsbcriber = () => void;
type Cleanup = () => void;

export function Subscription() {
  const subscribers = new Set<Subsbcriber>();
  return {
    notify: () => {
      for (const subscriber of subscribers) {
        subscriber();
      }
    },
    subscribe: (subscriber: Subsbcriber): Cleanup => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
