import type { OptimizeCalculation } from "./optimize-manager.types";

export class CalculationSorter {
  readonly defaultCalculation: OptimizeCalculation = {
    damage: -Infinity,
    artifacts: [],
  };

  st = this.defaultCalculation;
  nd = this.defaultCalculation;
  rd = this.defaultCalculation;

  add = (data: OptimizeCalculation) => {
    const dmg = data.damage;

    if (dmg > this.st.damage) {
      this.rd = this.nd;
      this.nd = this.st;
      this.st = data;
    } //
    else if (dmg > this.nd.damage && dmg !== this.st.damage) {
      this.rd = this.nd;
      this.nd = data;
    } //
    else if (dmg > this.rd.damage && dmg !== this.nd.damage && dmg !== this.st.damage) {
      this.rd = data;
    }
  };

  get = () => {
    let calcs = [];
    if (this.st.damage !== -Infinity) calcs.push(this.st);
    if (this.nd.damage !== -Infinity) calcs.push(this.nd);
    if (this.rd.damage !== -Infinity) calcs.push(this.rd);

    this.st = this.defaultCalculation;
    this.nd = this.defaultCalculation;
    this.rd = this.defaultCalculation;

    return calcs;
  };
}
