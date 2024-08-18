import {
  AppliedAttackBonus,
  AppliedAttributeBonus,
  TotalAttributeControl,
  AppWeapon,
  AppliedBonuses,
  AppCharacter,
  ArtifactSetBonus,
  AppArtifact,
} from "@Backend";
import type {
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationPartyData,
} from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { BuffApplierCore, EntityCalc } from "@Backend";
import { CoreBonusesControl } from "./core-bonuses-control";

export class MemberBonusesControl extends BuffApplierCore {
  private rootTotalAttr: TotalAttributeControl;
  private innateAttrBonus: SimulationAttributeBonus[] = [];
  private innateAttkBonus: SimulationAttackBonus[] = [];
  private bonusesCtrl = new CoreBonusesControl();

  isOnfield = false;

  get totalAttr() {
    return this.totalAttrCtrl.finalize();
  }

  get attrBonus() {
    return this.innateAttrBonus.concat(this.partyBonus.getAttrBonuses(this.isOnfield), this.bonusesCtrl.attrBonus);
  }

  get attkBonus() {
    return this.innateAttkBonus.concat(this.partyBonus.getAttkBonuses(this.isOnfield), this.bonusesCtrl.attkBonus);
  }

  constructor(
    readonly info: SimulationMember,
    readonly data: AppCharacter,
    appWeapon: AppWeapon,
    appArtifacts: Record<string, AppArtifact>,
    setBonuses: ArtifactSetBonus[],
    partyData: SimulationPartyData,
    private partyBonus: PartyBonusControl
  ) {
    const rootTotalAttr = new TotalAttributeControl();

    rootTotalAttr.construct(info, data, info.weapon, appWeapon, info.artifacts);

    super(
      {
        char: info,
        appChar: data,
        partyData,
      },
      rootTotalAttr.clone()
    );

    this.rootTotalAttr = rootTotalAttr;

    const { innateBuffs = [] } = data;

    for (const buff of innateBuffs) {
      if (EntityCalc.isGrantedEffect(buff, info)) {
        const appliedBonuses = this.getAppliedCharacterBonuses({
          description: `Self / ${buff.src}`,
          buff,
          inputs: [],
          fromSelf: true,
          isFinal: false,
        });
        this.applyInnateBonuses(appliedBonuses);
      }
    }

    const appliedWeaponBonuses = this.getApplyWeaponBonuses({
      description: `${appWeapon.name} bonus`,
      buff: {
        effects: appWeapon.bonuses,
      },
      refi: info.weapon.refi,
      inputs: [],
      fromSelf: true,
      isFinal: false,
    });
    this.applyInnateBonuses(appliedWeaponBonuses);

    for (const setBonus of setBonuses) {
      for (let i = 0; i <= setBonus.bonusLv; i++) {
        const data = appArtifacts[setBonus.code];
        const buff = data?.setBonuses?.[i];

        if (buff && buff.effects) {
          const appliedBonuses = this.getApplyArtifactBonuses({
            description: `${data.name} / ${i * 2 + 2}-piece bonus`,
            buff: {
              effects: buff.effects,
            },
            inputs: [],
            fromSelf: true,
            isFinal: false,
          });
          this.applyInnateBonuses(appliedBonuses);
        }
      }
    }
  }

  private applyInnateBonuses = (applied: AppliedBonuses) => {
    for (const bonus of applied.attrBonuses) {
      this.innateAttrBonus.push(CoreBonusesControl.processAttributeBonus(bonus));
    }
    for (const bonus of applied.attkBonuses) {
      this.innateAttkBonus.push(CoreBonusesControl.processAttackBonus(bonus));
    }
  };

  switch = (dir: "in" | "out") => {
    this.isOnfield = dir === "in";
  };

  resetBonuses = () => {
    this.bonusesCtrl.attrBonus = [];
    this.bonusesCtrl.attkBonus = [];
  };

  applyBonuses = () => {
    this.totalAttrCtrl = this.rootTotalAttr.clone();

    for (const bonus of this.attrBonus) {
      const add = bonus.isStable ? this.totalAttrCtrl.addStable : this.totalAttrCtrl.addUnstable;
      add(bonus.toStat, bonus.value, bonus.description);
    }
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.bonusesCtrl.updateAttrBonuses(bonus);
  };

  updateAttkBonus = (bonus: AppliedAttackBonus) => {
    this.bonusesCtrl.updateAttkBonuses(bonus);
  };
}
