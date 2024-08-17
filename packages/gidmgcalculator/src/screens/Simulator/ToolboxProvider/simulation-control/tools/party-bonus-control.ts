import { AppliedAttackBonus, AppliedAttributeBonus, ElementType, GeneralCalc, RESONANCE_STAT } from "@Backend";
import { SimulationAttributeBonus, SimulationPartyData } from "@Src/types";
import { CoreBonusesControl } from "./core-bonuses-control";

export class PartyBonusControl {
  private partyBonusCtrl = new CoreBonusesControl();
  private onfieldBonusCtrl = new CoreBonusesControl();
  private deadAttrBonuses: SimulationAttributeBonus[] = [];

  getAttrBonuses = (onfield = false) => {
    return onfield
      ? this.partyBonusCtrl.attrBonus.concat(this.onfieldBonusCtrl.attrBonus)
      : this.partyBonusCtrl.attrBonus;
  };

  getAttkBonuses = (onfield = false) => {
    return onfield
      ? this.partyBonusCtrl.attkBonus.concat(this.onfieldBonusCtrl.attkBonus)
      : this.partyBonusCtrl.attkBonus;
  };

  constructor(partyData: SimulationPartyData) {
    // Resonance
    const elmtsCount = GeneralCalc.countElements(partyData);
    const appliedResonanceElmts: ElementType[] = ["pyro", "hydro", "geo", "dendro"];

    for (const elmt of appliedResonanceElmts) {
      const { [elmt]: elmtCount = 0 } = elmtsCount;

      if (elmtCount >= 2) {
        const resonance = RESONANCE_STAT[elmt];
        const bonus: SimulationAttributeBonus = {
          id: `${elmt}-dead-reso`,
          value: resonance.value,
          isStable: true,
          toStat: resonance.key,
          type: "ATTRIBUTE",
          description: `${elmt.slice(0, 1).toUpperCase()}${elmt.slice(1)} Resonance`,
        };

        this.deadAttrBonuses.push(bonus);
        this.partyBonusCtrl.attrBonus.push(bonus);
      }
    }
  }

  reset = () => {
    this.partyBonusCtrl.attrBonus = this.deadAttrBonuses.concat();
    this.partyBonusCtrl.attkBonus = [];
    this.onfieldBonusCtrl.attrBonus = [];
    this.onfieldBonusCtrl.attkBonus = [];
  };

  updatePartyAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.partyBonusCtrl.updateAttrBonuses(bonus);
  };

  updatePartyAttkBonus = (bonus: AppliedAttackBonus) => {
    this.partyBonusCtrl.updateAttkBonuses(bonus);
  };

  updateOnfieldAttrBonus = (bonus: AppliedAttributeBonus) => {
    this.onfieldBonusCtrl.updateAttrBonuses(bonus);
  };

  updateOnfieldAttkBonus = (bonus: AppliedAttackBonus) => {
    this.onfieldBonusCtrl.updateAttkBonuses(bonus);
  };
}
