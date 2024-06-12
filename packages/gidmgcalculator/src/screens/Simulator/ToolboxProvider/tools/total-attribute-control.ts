import { TotalAttributeControl } from "@Backend";

export class SimulatorTotalAttributeControl extends TotalAttributeControl {
  clone = () => {
    const clonedCtrl = new SimulatorTotalAttributeControl(structuredClone(this.totalAttr));
    return clonedCtrl;
  };
}
