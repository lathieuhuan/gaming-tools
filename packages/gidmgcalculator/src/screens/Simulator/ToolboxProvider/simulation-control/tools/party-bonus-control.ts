import { ElementType, GeneralCalc, RESONANCE_STAT } from "@Backend";
import { SimulationAttributeBonus, SimulationPartyData } from "@Src/types";
import { CoreBonusesControl } from "./core-bonuses-control";

/**
 * This class is for managing:
 * - Common bonuses that are applied to all party members. **commonBonusesCtrl**
 * - On-field bonuses that are only applied to the on-field member. **onfieldBonusesCtrl**
 * - Fixed attribute bonuses that are applied to all party members (such as resonance),
 *   only made at the start of the Simulation. **fixedAttrBonuses**
 */
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

  updateCommonAttrBonuses: typeof this.commonBonusesCtrl.updateAttrBonuses = (bonus) => {
    this.commonBonusesCtrl.updateAttrBonuses(bonus);
  };

  updateCommonAttkBonuses: typeof this.commonBonusesCtrl.updateAttkBonuses = (bonus) => {
    this.commonBonusesCtrl.updateAttkBonuses(bonus);
  };

  updateOnfieldAttrBonuses: typeof this.commonBonusesCtrl.updateAttrBonuses = (bonus) => {
    this.onfieldBonusesCtrl.updateAttrBonuses(bonus);
  };

  updateOnfieldAttkBonuses: typeof this.commonBonusesCtrl.updateAttkBonuses = (bonus) => {
    this.onfieldBonusesCtrl.updateAttkBonuses(bonus);
  };

  reset = () => {
    this.commonBonusesCtrl.reset(this.fixedAttrBonuses.concat());
    this.onfieldBonusesCtrl.reset();
  };
}
