export class Watcher {
  changed = false;

  start = () => {
    this.changed = false;
  };

  mark = () => {
    this.changed = true;
  };
}

export class WatchedSet<T> extends Set<T> {
  constructor(private watcher: Watcher, values?: readonly T[] | null) {
    super(values);
  }
  add(value: T) {
    this.watcher.mark();
    super.add(value);
    return this;
  }
  delete(value: T) {
    this.watcher.mark();
    return super.delete(value);
  }
  clear(): void {
    this.watcher.mark();
    super.clear();
  }
}
