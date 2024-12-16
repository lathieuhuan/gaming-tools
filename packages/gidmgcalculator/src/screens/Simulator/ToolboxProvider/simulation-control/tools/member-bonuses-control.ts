import {
  AppArtifact,
  AppCharacter,
  AppliedAttackBonus,
  AppliedAttributeBonus,
  AppliedBonuses,
  AppliedBonusesGetter,
  AppWeapon,
  ArtifactSetBonus,
  isGrantedEffect,
  TotalAttributeControl,
} from "@Backend";
import type {
  SimulationAttackBonus,
  SimulationAttributeBonus,
  SimulationMember,
  SimulationPartyData,
} from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { CoreBonusesControl } from "./core-bonuses-control";

export class MemberBonusesControl {
  private rootTotalAttr: TotalAttributeControl;
  private _totalAttrCtrl: TotalAttributeControl;
  private innateAttrBonus: SimulationAttributeBonus[] = [];
  private innateAttkBonus: SimulationAttackBonus[] = [];
  private bonusesCtrl = new CoreBonusesControl();

  bonusGetter: AppliedBonusesGetter;
  isOnfield = false;

  get totalAttr() {
    return this._totalAttrCtrl.finalize();
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
    protected partyData: SimulationPartyData,
    private partyBonus: PartyBonusControl
  ) {
    const rootTotalAttr = new TotalAttributeControl().construct(info, data, info.weapon, appWeapon, info.artifacts);
    const cloneTotalAttrCtrl = rootTotalAttr.clone();

    this.bonusGetter = new AppliedBonusesGetter(
      {
        char: info,
        appChar: data,
        partyData,
      },
      cloneTotalAttrCtrl
    );

    this.rootTotalAttr = rootTotalAttr;
    this._totalAttrCtrl = cloneTotalAttrCtrl;

    const { innateBuffs = [] } = data;

    for (const buff of innateBuffs) {
      if (isGrantedEffect(buff, info)) {
        const appliedBonuses = this.bonusGetter.getAppliedBonuses(
          buff,
          {
            inputs: [],
            fromSelf: true,
          },
          `Self / ${buff.src}`,
          false
        );
        this.applyInnateBonuses(appliedBonuses);
      }
    }

    const appliedWeaponBonuses = this.bonusGetter.getAppliedBonuses(
      {
        effects: appWeapon.bonuses,
      },
      {
        refi: info.weapon.refi,
        inputs: [],
        fromSelf: true,
      },
      `${appWeapon.name} bonus`,
      false
    );
    this.applyInnateBonuses(appliedWeaponBonuses);

    for (const setBonus of setBonuses) {
      for (let i = 0; i <= setBonus.bonusLv; i++) {
        const data = appArtifacts[setBonus.code];
        const buff = data?.setBonuses?.[i];

        if (buff && buff.effects) {
          const appliedBonuses = this.bonusGetter.getAppliedBonuses(
            {
              effects: buff.effects,
            },
            {
              inputs: [],
              fromSelf: true,
            },
            `${data.name} / ${i * 2 + 2}-piece bonus`,
            false
          );
          this.applyInnateBonuses(appliedBonuses);
        }
      }
    }
  }

  private applyInnateBonuses = (applied: AppliedBonuses) => {
    for (const bonus of applied.attrBonuses) {
      this.innateAttrBonus.push(bonus);
    }
    for (const bonus of applied.attkBonuses) {
      this.innateAttkBonus.push(bonus);
    }
  };

  switch = (dir: "in" | "out") => {
    this.isOnfield = dir === "in";
  };

  resetBonuses = () => {
    this.bonusesCtrl.reset();
  };

  applyBonuses = () => {
    this._totalAttrCtrl = this.rootTotalAttr.clone();
    this._totalAttrCtrl.applyBonuses(this.attrBonus);
  };

  updateAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.bonusesCtrl.updateAttrBonuses(bonus);
  };

  updateAttkBonus = (bonus: AppliedAttackBonus) => {
    this.bonusesCtrl.updateAttkBonuses(bonus);
  };
}
