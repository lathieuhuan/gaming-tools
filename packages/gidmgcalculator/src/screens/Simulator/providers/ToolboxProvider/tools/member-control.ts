import {
  AppCharacter,
  AttackBonusControl,
  AttackPattern,
  CalcItem,
  CharacterCalc,
  SimulatorBuffApplier,
  TalentType,
  TotalAttributeControl,
  configTalentEvent,
} from "@Backend";
import type { Character, ElementModCtrl, PartyData, SimulationMember, SimulationTarget } from "@Src/types";
import type { SimulationAttackBonus } from "./tools.types";

import { AttackPatternConf } from "@Src/backend/calculation";
import { $AppWeapon } from "@Src/services";
import { pickProps } from "@Src/utils";
import { SimulatorTotalAttributeControl } from "./total-attribute-control";

export class MemberControl {
  info: Character;
  data: AppCharacter;
  totalAttr: TotalAttributeControl;
  buffApplier: SimulatorBuffApplier;
  attkBonus: SimulationAttackBonus[] = [];

  constructor(member: SimulationMember, appChar: AppCharacter, partyData: PartyData) {
    const char: Character = pickProps(member, ["name", "level", "cons", "NAs", "ES", "EB"]);
    const appWeapon = $AppWeapon.get(member.weapon.code)!;
    const totalAttrCtrl = new SimulatorTotalAttributeControl();

    totalAttrCtrl.construct(char, appChar, member.weapon, appWeapon, member.artifacts);

    this.info = char;
    this.data = appChar;
    this.totalAttr = totalAttrCtrl.clone();
    this.buffApplier = new SimulatorBuffApplier({ char, appChar, partyData }, this.totalAttr);
  }

  hit = (
    talentType: TalentType,
    patternKey: AttackPattern,
    item: CalcItem,
    elmtModCtrls: Partial<ElementModCtrl>,
    partyData: PartyData,
    target: SimulationTarget
  ) => {
    const attBonus = new AttackBonusControl();

    for (const bonus of this.attkBonus) {
      attBonus.add(bonus.toType, bonus.toKey, bonus.value, "");
    }

    const info = {
      char: this.info,
      appChar: this.data,
      partyData,
    };
    const level = CharacterCalc.getFinalTalentLv({ ...info, talentType });
    const totalAttr = this.totalAttr.finalize();

    const { disabled, configCalcItem } = AttackPatternConf({
      ...info,
      totalAttr,
      attBonus,
      selfBuffCtrls: [],
      customInfusion: {
        element: "phys",
      },
    })(patternKey);

    return configTalentEvent({
      itemConfig: configCalcItem(item, {
        absorption: null,
        reaction: null,
        infuse_reaction: null,
        ...elmtModCtrls,
      }),
      level,
      totalAttr,
      attBonus,
      info,
      target,
    });
  };
}
