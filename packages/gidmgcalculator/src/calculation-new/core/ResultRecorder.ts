import { ResultItemRecord } from "../types";

export class ResultRecorder {
  #data: ResultItemRecord = {
    factors: [],
    bonusMult: 1,
  };

  constructor(initial: Partial<ResultItemRecord> = {}, private shouldRecord = false) {
    this.record(initial);
  }

  get data(): ResultItemRecord {
    return this.#data;
  }

  record(data: Partial<ResultItemRecord>) {
    if (this.shouldRecord) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }
}
