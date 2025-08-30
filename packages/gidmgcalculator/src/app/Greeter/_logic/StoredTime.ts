export class StoredTime {
  constructor(private key: string) {}

  get value(): number {
    const string = localStorage.getItem(this.key) || "";
    return string ? +string : 0;
  }

  set value(value: string | number) {
    localStorage.setItem(this.key, `${value}`);
  }
}
