import { TotalAttributeControl } from "@Backend";
import { toArray } from "@Src/utils";
import { SimulationAttributeBonus } from "./tools.types";

export class SimulatorTotalAttributeControl extends TotalAttributeControl {
  clone = () => {
    const clonedCtrl = new SimulatorTotalAttributeControl(structuredClone(this.totalAttr));
    return clonedCtrl;
  };

  applyAttributeBonus = (bonuses?: SimulationAttributeBonus[]) => {
    if (bonuses) {
      for (const bonus of bonuses) {
        const description = `${bonus.trigger.character} / ${bonus.trigger.modifier}`;
        const add = bonus.stable ? this.addStable : this.addUnstable;

        for (const key of toArray(bonus.toStat)) {
          add(key, bonus.value, description);
        }
      }
    }
  };
}
