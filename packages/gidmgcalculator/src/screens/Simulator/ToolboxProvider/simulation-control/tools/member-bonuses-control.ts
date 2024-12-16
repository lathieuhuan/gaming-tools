import {
  AppArtifact,
  AppCharacter,
  AppliedBonuses,
  AppliedBonusesGetter,
  AppWeapon,
  ArtifactSetBonus,
  isGrantedEffect,
  TotalAttributeControl,
} from "@Backend";
import type { SimulationMember, SimulationPartyData } from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { CoreBonusesControl } from "./core-bonuses-control";

export class MemberBonusesControl {
  private rootTotalAttrCtrl: TotalAttributeControl;
  private currentTotalAttrCtrl: TotalAttributeControl;
  private innateBonusesCtrl = new CoreBonusesControl();
  private bonusesCtrl = new CoreBonusesControl();

  protected bonusGetter: AppliedBonusesGetter;
  isOnfield = false;

  get totalAttr() {
    return this.currentTotalAttrCtrl.finalize();
  }

  get attrBonuses() {
    return this.innateBonusesCtrl.attrBonuses.concat(
      this.bonusesCtrl.attrBonuses,
      this.partyBonusesCtrl.getAttrBonuses(this.isOnfield)
    );
  }

  get attkBonuses() {
    return this.innateBonusesCtrl.attkBonuses.concat(
      this.bonusesCtrl.attkBonuses,
      this.partyBonusesCtrl.getAttkBonuses(this.isOnfield)
    );
  }

  constructor(
    readonly info: SimulationMember,
    readonly data: AppCharacter,
    appWeapon: AppWeapon,
    appArtifacts: Record<string, AppArtifact>,
    setBonuses: ArtifactSetBonus[],
    protected partyData: SimulationPartyData,
    private partyBonusesCtrl: PartyBonusControl
  ) {
    const rootTotalAttrCtrl = new TotalAttributeControl().construct(info, data, info.weapon, appWeapon, info.artifacts);
    const cloneTotalAttrCtrl = rootTotalAttrCtrl.clone();

    this.bonusGetter = new AppliedBonusesGetter(
      {
        char: info,
        appChar: data,
        partyData,
      },
      cloneTotalAttrCtrl
    );

    this.rootTotalAttrCtrl = rootTotalAttrCtrl;
    this.currentTotalAttrCtrl = cloneTotalAttrCtrl;

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
      this.innateBonusesCtrl.updateAttrBonuses(bonus);
    }
    for (const bonus of applied.attkBonuses) {
      this.innateBonusesCtrl.updateAttkBonuses(bonus);
    }
  };

  switch = (dir: "in" | "out") => {
    this.isOnfield = dir === "in";
  };

  applyBonuses = () => {
    this.currentTotalAttrCtrl = this.rootTotalAttrCtrl.clone();
    this.currentTotalAttrCtrl.applyBonuses(this.attrBonuses);

    this.bonusGetter = new AppliedBonusesGetter(
      {
        char: this.info,
        appChar: this.data,
        partyData: this.partyData,
      },
      this.currentTotalAttrCtrl
    );
  };

  updateAttrBonuses: typeof this.bonusesCtrl.updateAttrBonuses = (bonus) => {
    this.bonusesCtrl.updateAttrBonuses(bonus);
  };

  updateAttkBonuses: typeof this.bonusesCtrl.updateAttkBonuses = (bonus) => {
    this.bonusesCtrl.updateAttkBonuses(bonus);
  };

  resetBonuses = () => {
    this.bonusesCtrl.reset();
  };
}
