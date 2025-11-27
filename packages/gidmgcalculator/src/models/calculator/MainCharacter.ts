import type { Team } from "@/models/base";
import type { ICharacterBasic } from "@/types";
import type { PartiallyRequiredOnly } from "rond";

import { CalcCharacter, ICalcCharacter } from "@/models/base";
import { $AppCharacter, $AppSettings } from "@/services";
import { MainArtifactGear } from "./MainArtifactGear";
import { MainWeapon } from "./MainWeapon";

export type MainCharacterUpdateData = Partial<
  Pick<
    MainCharacter,
    keyof ICharacterBasic | "weapon" | "artifact" | "attkBonusCtrl" | "totalAttrs"
  >
>;

export type MainCharacterConstructInfo = PartiallyRequiredOnly<
  ICalcCharacter<MainWeapon, MainArtifactGear>,
  "name"
>;

export class MainCharacter extends CalcCharacter<MainWeapon, MainArtifactGear> {
  //
  constructor(info: MainCharacterConstructInfo, data = $AppCharacter.get(info.name), team?: Team) {
    const { charLevel, charCons, charNAs, charES, charEB } = $AppSettings.get();
    const {
      name,
      level = charLevel,
      NAs = charNAs,
      ES = charES,
      EB = charEB,
      cons = charCons,
      enhanced = false,
      weapon = MainWeapon.DEFAULT(data.weaponType),
      artifact = new MainArtifactGear(),
      attkBonusCtrl,
      totalAttrs,
    } = info;

    super(
      { name, level, NAs, ES, EB, cons, enhanced, weapon, artifact, attkBonusCtrl, totalAttrs },
      data,
      team
    );
  }

  update(data: MainCharacterUpdateData) {
    return new MainCharacter({
      ...this,
      ...data,
    });
  }

  clone() {
    return new MainCharacter({
      name: this.name,
      level: this.level,
      NAs: this.NAs,
      ES: this.ES,
      EB: this.EB,
      cons: this.cons,
      enhanced: this.enhanced,
      weapon: this.weapon.clone(),
      artifact: this.artifact.clone(),
      attkBonusCtrl: this.attkBonusCtrl.clone(),
      totalAttrs: this.totalAttrs.clone(),
    });
  }
}
