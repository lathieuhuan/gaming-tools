import { AppliedAttackBonus, AppliedAttributeBonus, GeneralCalc } from "@Backend";
import { SimulationPartyData } from "@Src/types";
import { CoreBonusesControl } from "./low-level";

export class PartyBonusControl {
  private partyBonusCtrl = new CoreBonusesControl();
  private onfieldBonusCtrl = new CoreBonusesControl();

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
    const { pyro = 0, hydro = 0 } = GeneralCalc.countElements(partyData);

    if (pyro >= 2) {
      this.partyBonusCtrl.attrBonus.push({
        id: "pyro-resonance",
        value: 25,
        isStable: true,
        toStat: "atk_",
        type: "ATTRIBUTE",
        description: "Pyro Resonance",
      });
    }
    if (hydro >= 2) {
      this.partyBonusCtrl.attrBonus.push({
        id: "hydro-resonance",
        value: 25,
        isStable: true,
        toStat: "hp_",
        type: "ATTRIBUTE",
        description: "Hydro Resonance",
      });
    }
  }

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
