import { AppliedAttackBonus, AppliedAttributeBonus, ElementType, GeneralCalc, RESONANCE_STAT } from "@Backend";
import { SimulationAttributeBonus, SimulationPartyData } from "@Src/types";
import { CoreBonusesControl } from "./core-bonuses-control";

export class PartyBonusControl {
  private commonBonusesCtrl = new CoreBonusesControl();
  private onfieldBonusesCtrl = new CoreBonusesControl();
  private fixedAttrBonuses: SimulationAttributeBonus[] = [];

  getAttrBonuses = (onfield = false) => {
    return this.commonBonusesCtrl.attrBonuses.concat(onfield ? this.onfieldBonusesCtrl.attrBonuses : []);
  };

  getAttkBonuses = (onfield = false) => {
    return this.commonBonusesCtrl.attkBonuses.concat(onfield ? this.onfieldBonusesCtrl.attkBonuses : []);
  };

  constructor(partyData: SimulationPartyData) {
    // Resonance
    const elmtsCount = GeneralCalc.countElements(partyData);
    const appliedResonanceElmts: ElementType[] = ["pyro", "hydro", "geo", "dendro"];

    for (const elmt of appliedResonanceElmts) {
      if (elmtsCount.get(elmt) >= 2) {
        const resonance = RESONANCE_STAT[elmt];
        const bonus: SimulationAttributeBonus = {
          id: `${elmt}-dead-reso`,
          value: resonance.value,
          isStable: true,
          toStat: resonance.key,
          description: `${elmt.slice(0, 1).toUpperCase()}${elmt.slice(1)} Resonance`,
        };

        this.fixedAttrBonuses.push(bonus);
        this.commonBonusesCtrl.updateAttrBonuses(bonus);
      }
    }
  }

  updateCommonAttrBonuses = (bonus: AppliedAttributeBonus) => {
    this.commonBonusesCtrl.updateAttrBonuses(bonus);
  };

  updateCommonAttkBonuses = (bonus: AppliedAttackBonus) => {
    this.commonBonusesCtrl.updateAttkBonuses(bonus);
  };

  updateOnfieldAttrBonuses = (bonus: AppliedAttributeBonus) => {
    this.onfieldBonusesCtrl.updateAttrBonuses(bonus);
  };

  updateOnfieldAttkBonuses = (bonus: AppliedAttackBonus) => {
    this.onfieldBonusesCtrl.updateAttkBonuses(bonus);
  };

  reset = () => {
    this.commonBonusesCtrl.reset(this.fixedAttrBonuses.concat());
    this.onfieldBonusesCtrl.reset();
  };
}
