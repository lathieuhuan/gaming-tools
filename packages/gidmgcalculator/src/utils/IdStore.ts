export default class IdStore {
  private id: number;

  get latest() {
    return this.id;
  }

  constructor(initialId: number = Date.now()) {
    this.id = initialId;
  }

  gen() {
    return this.id++;
  }
}
