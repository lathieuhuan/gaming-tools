import {
  AppArtifact,
  AppCharacter,
  AppliedBonusesGetter,
  AppWeapon,
  ArtifactSetBonus,
  isGrantedEffect,
  TotalAttributeControl,
} from "@Backend";
import type { SimulationMember, SimulationPartyData } from "@Src/types";
import type { PartyBonusControl } from "./party-bonus-control";

import { CoreBonusesControl } from "./core-bonuses-control";

/**
 * This class is for:
 * - Managing member's Total Attribute. **currentTotalAttrCtrl** & **rootTotalAttrCtrl**
 * - Managing member's innate bonuses from this member's innate buffs. **innateBonusesCtrl**
 * - Managing bonuses that are applied to this member only. **bonusesCtrl**
 * - Tracking member's on-field status.
 * - Getting bonuses from this member's buff. **bonusGetter** (protected)
 */
export class MemberBonusesControl {
  private rootTotalAttrCtrl: TotalAttributeControl;
  private currentTotalAttrCtrl: TotalAttributeControl;
  private innateBonusesCtrl = new CoreBonusesControl();
  private bonusesCtrl = new CoreBonusesControl();
  private isOnfield = false;

  protected bonusGetter: AppliedBonusesGetter;

  get totalAttr() {
    return this.currentTotalAttrCtrl.finalize();
  }

  /** All attribute bonuses applied to this member */
  get attrBonuses() {
    return this.innateBonusesCtrl.attrBonuses.concat(
      this.bonusesCtrl.attrBonuses,
      this.partyBonusesCtrl.getAttrBonuses(this.isOnfield)
    );
  }

  /** All attack bonuses applied to this member */
  get attkBonuses() {
    return this.innateBonusesCtrl.attkBonuses.concat(
      this.bonusesCtrl.attkBonuses,
      this.partyBonusesCtrl.getAttkBonuses(this.isOnfield)
    );
  }

  constructor(
    readonly info: SimulationMember,
    readonly data: AppCharacter,
    readonly weaponData: AppWeapon,
    appArtifacts: Record<string, AppArtifact>,
    readonly setBonuses: ArtifactSetBonus[],
    protected partyData: SimulationPartyData,
    private partyBonusesCtrl: PartyBonusControl
  ) {
    const rootTotalAttrCtrl = new TotalAttributeControl().construct(
      info,
      data,
      info.weapon,
      weaponData,
      info.artifacts
    );
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

    if (data.innateBuffs) {
      for (const buff of data.innateBuffs) {
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
          this.innateBonusesCtrl.updateBonuses(appliedBonuses);
        }
      }
    }

    const appliedWeaponBonuses = this.bonusGetter.getAppliedBonuses(
      {
        effects: weaponData.bonuses,
      },
      {
        refi: info.weapon.refi,
        inputs: [],
        fromSelf: true,
      },
      `${weaponData.name} bonus`,
      false
    );
    this.innateBonusesCtrl.updateBonuses(appliedWeaponBonuses);

    for (const setBonus of setBonuses) {
      for (let i = 0; i <= setBonus.bonusLv; i++) {
        const data = appArtifacts[setBonus.code];
        const buff = data?.setBonuses?.[i];

        if (buff?.effects) {
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
          this.innateBonusesCtrl.updateBonuses(appliedBonuses);
        }
      }
    }
  }

  switch = (dir: "in" | "out") => {
    this.isOnfield = dir === "in";
  };

  /** Apply all attribute bonuses that can be applied to this member to update their Total Attribute */
  applyBonuses = () => {
    // Reset currentTotalAttrCtrl to root because we're gonna apply all attribute bonuses over again.
    // (We cannot revert attribute bonuses out of the current Total Attribute so this is the way)
    this.currentTotalAttrCtrl = this.rootTotalAttrCtrl.clone();
    this.currentTotalAttrCtrl.applyBonuses(this.attrBonuses);
    this.bonusGetter.updateTotalAttrCtrl(this.currentTotalAttrCtrl);
  };

  /**
   * @param bonuses applied to this member only
   */
  updateAttrBonuses: typeof this.bonusesCtrl.updateAttrBonuses = (bonuses) => {
    this.bonusesCtrl.updateAttrBonuses(bonuses);
  };

  /**
   * @param bonuses applied to this member only
   */
  updateAttkBonuses: typeof this.bonusesCtrl.updateAttkBonuses = (bonuses) => {
    this.bonusesCtrl.updateAttkBonuses(bonuses);
  };

  /** Reset the bonuses that are applied to this member only */
  resetBonuses = () => {
    this.bonusesCtrl.reset();
  };
}
