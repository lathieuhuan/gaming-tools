import type { Clonable } from "@/models/interfaces";

import { CharacterCalc } from "@/models";

export class MemberCalc extends CharacterCalc implements Clonable<MemberCalc> {

  override clone() {
    const clone = super.clone();

    return new MemberCalc(clone, this.data, this.team);
  }

  override deepClone() {
    const clone = super.deepClone();

    return new MemberCalc(clone, this.data, this.team);
  }
}
