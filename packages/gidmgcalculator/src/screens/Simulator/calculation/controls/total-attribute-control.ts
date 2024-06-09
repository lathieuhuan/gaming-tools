import { TotalAttributeControl } from "@Backend";
import { SimulationAttributeBonus } from "@Src/types";
import { toArray } from "@Src/utils";

export class SimulatorTotalAttributeControl extends TotalAttributeControl {
  constructor() {
    super();
  }

  applyAttributeBonus = (bonuses?: SimulationAttributeBonus[]) => {
    const clonedCtrl = new TotalAttributeControl(structuredClone(this.totalAttr));

    if (bonuses) {
      for (const bonus of bonuses) {
        const description = `${bonus.trigger.character} / ${bonus.trigger.src}`;
        const add = bonus.stable ? clonedCtrl.addStable : clonedCtrl.addUnstable;

        for (const key of toArray(bonus.toStat)) {
          add(key, bonus.value, description);
        }
      }
    }

    return clonedCtrl;
  };
}
