export class Subject<T> {
  subscribers: Set<(value: T) => void> = new Set();

  subscribe(subscriber: (value: T) => void) {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  next(value: T) {
    this.subscribers.forEach((subscriber) => subscriber(value));
  }
}
