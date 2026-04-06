import { Subject } from "ron-utils";

export type CheckboxGroupOptionValue = string | number;

export type CheckboxGroupOption<T extends CheckboxGroupOptionValue> = {
  label?: string;
  value: T;
};

export type CheckboxGroupControlOptions<T extends CheckboxGroupOptionValue> = {
  onChange?: (values: Set<T>) => void;
};

export class CheckboxGroupControl<T extends CheckboxGroupOptionValue> {
  values: Set<T>;
  options: CheckboxGroupControlOptions<T>;

  private cachedValues: T[];
  private subjects = new Map<T, Subject<boolean>>();

  constructor(values: T[] = [], options: CheckboxGroupControlOptions<T> = {}) {
    this.cachedValues = values;
    this.values = new Set(values);
    this.options = options;
  }

  private getSubject(key: T) {
    const subject = this.subjects.get(key);

    if (subject) {
      return subject;
    }

    const newSubject = new Subject<boolean>();
    this.subjects.set(key, newSubject);

    return newSubject;
  }

  subscribe(key: T, subscriber: (checked: boolean) => void) {
    const subject = this.getSubject(key);
    const unsubscribe = subject.subscribe(subscriber);

    return () => {
      unsubscribe();

      if (subject.subscribers.size === 0) {
        this.subjects.delete(key);
      }
    };
  }

  toggle(key: T, checked?: boolean) {
    const newChecked = checked ?? !this.values.has(key);

    if (newChecked) {
      this.values.add(key);
    } else {
      this.values.delete(key);
    }

    this.getSubject(key).next(newChecked);
    this.options.onChange?.(this.values);
  }

  syncValues(values?: T[]) {
    if (!values || values === this.cachedValues) {
      return;
    }

    this.cachedValues = values;
    this.values = new Set(values);

    this.subjects.forEach((subject, key) => {
      subject.next(this.values.has(key));
    });
  }
}
