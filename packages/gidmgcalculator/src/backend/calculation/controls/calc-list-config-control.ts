import type { AttackPattern, CharacterBuffCalcListConfig } from "@Src/backend/types";

export class CalcListConfigControl {
  private config: CharacterBuffCalcListConfig = {};

  update(props: CharacterBuffCalcListConfig) {
    this.config = {
      ...this.config,
      ...props,
    };
  }

  get(key: AttackPattern) {
    return this.config[key];
  }
}
