export class TimeStore {
  constructor(private key: string) {}

  get(): number {
    const string = localStorage.getItem(this.key) || "";
    return string ? +string : 0;
  }

  set(value: string | number) {
    localStorage.setItem(this.key, `${value}`);
  }

  remove() {
    localStorage.removeItem(this.key);
  }
}
