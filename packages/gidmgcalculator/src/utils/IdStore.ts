export default class IdStore {
  private id: number;

  get latest() {
    return this.id;
  }

  constructor(initialId: number = Date.now()) {
    this.id = initialId;
  }

  reset(id = Date.now()) {
    this.id = id;
  }

  gen() {
    return this.id++;
  }
}
