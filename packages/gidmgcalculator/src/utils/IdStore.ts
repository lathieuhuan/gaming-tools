export default class IdStore {
  private id: number;

  constructor(initialId: number = Date.now()) {
    this.id = initialId;
  }

  gen() {
    return this.id++;
  }
}
