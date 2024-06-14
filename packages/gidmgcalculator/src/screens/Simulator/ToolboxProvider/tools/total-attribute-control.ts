import { TotalAttributeControl } from "@Backend";

export class SimulatorTotalAttributeControl extends TotalAttributeControl {
  private root: SimulatorTotalAttributeControl | undefined;

  clone = () => {
    this.root = new SimulatorTotalAttributeControl(structuredClone(this.totalAttr));
    return this.root;
  };

  reset = () => {
    this.root = new SimulatorTotalAttributeControl(structuredClone(this.totalAttr));
  };
}
