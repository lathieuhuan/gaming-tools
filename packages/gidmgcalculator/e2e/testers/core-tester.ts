import { Locator, Page, expect } from "@playwright/test";
import { selectOption } from "../utils/select-option";
import { toArray } from "../utils/to-array";

type BuffGroup = "Self buffs";

type SectionLabel = "Normal Attacks" | "Elemental Skill" | "Elemental Burst";

type InputType = "select";

type CalcFactorBase = {
  root: number;
  mult: number;
};

type CalcFactor = {
  bases: CalcFactorBase | CalcFactorBase[];
  flat: number;
  pct: number;
  specMult: number;
  defMult: number;
  resMult: number;
  cRate: number;
  cDmg: number;
};

type CalcAttPattConfigBase = {
  baseOn: "HP" | "ATK" | "DEF" | "Elemental Mastery";
  mult: number;
};

type CalcAttPattConfig = Partial<
  Pick<CalcFactor, "flat" | "pct" | "specMult" | "defMult" | "resMult" | "cRate" | "cDmg">
> & {
  bases: CalcAttPattConfigBase | CalcAttPattConfigBase[];
};

type ResultConfig = {
  section: SectionLabel;
  row: string;
  calc: CalcAttPattConfig;
};

type StepConfig = {
  change: () => Promise<any>;
  commonCalcChange?: Partial<CalcAttPattConfig>;
  calcChanges?: Array<Partial<CalcAttPattConfig> | null>;
};

export class CoreTester {
  protected page: Page;
  attributeTable: Locator;

  constructor(page: Page) {
    this.page = page;
  }

  protected getAttributeTableLocator = () => {
    this.attributeTable = this.page.getByRole("table", { name: "attribute-table" });
  };

  public activateBuff = async (group: BuffGroup, name: string) => {
    const collapseTrigger = this.page.getByTitle(group);
    const isExpanded = await collapseTrigger.getAttribute("aria-expanded");

    if (isExpanded !== "true") {
      await collapseTrigger.click();
    }

    const control = this.page.getByLabel(`${group} / ${name}`).getByRole("checkbox", { name });
    await control.check();
    return control;
  };

  public changeModInput = async (modifierLabel: string, inputLabel: string, inputType: InputType, value: string) => {
    const inputCtrl = this.page.getByLabel(modifierLabel).getByLabel(inputLabel);

    switch (inputType) {
      case "select":
        await inputCtrl.getByRole("combobox").click();
        await selectOption(this.page, value);
        break;
    }
  };

  private getAttributeLocator = (attribute: string) => {
    const cell = this.attributeTable.getByRole("row", { name: attribute }).getByRole("cell").nth(1);

    if (["HP", "ATK", "DEF"].includes(attribute)) {
      return cell.getByRole("paragraph").first();
    }
    return cell;
  };

  public async getAttributeValue(attribute: string): Promise<number>;
  public async getAttributeValue(locator: Locator): Promise<number>;
  public async getAttributeValue(arg: string | Locator): Promise<number> {
    const locator = typeof arg === "string" ? this.getAttributeLocator(arg) : arg;
    return +(await locator.innerText()).replace(/%/g, "");
  }

  private getResultLocator = (sectionLabel: SectionLabel, rowLabel: string) => {
    const cells = this.page
      .getByRole("table", { name: sectionLabel })
      .getByRole("row", { name: rowLabel })
      .getByRole("cell");

    return {
      baseLct: cells.nth(1),
      critLct: cells.nth(2),
      avgLct: cells.nth(3),
    };
  };

  private getResultValue = async (cellLct: Locator) => {
    return +(await cellLct.innerText());
  };

  private getResultValues = async (cellLct: Locator) => {
    const text = await cellLct.innerText();
    return text.split(" + ").map((n) => +n);
  };

  private calculate = (factor: CalcFactor) => {
    const totalBase = toArray(factor.bases).reduce((total, base) => total + base.root * (base.mult / 100), 0);
    const nonCrit = (totalBase + factor.flat) * (factor.pct / 100) * factor.specMult * factor.defMult * factor.resMult;
    const cDmg = factor.cDmg / 100;
    const cRate = factor.cRate / 100;

    return {
      base: nonCrit,
      crit: nonCrit * (1 + cDmg),
      avg: nonCrit * (1 + cDmg * cRate),
    };
  };

  private calcAttPatt = async (config: CalcAttPattConfig) => {
    const {
      flat = 0,
      pct = 100,
      specMult = 1,
      defMult = 0.653,
      resMult = 0.9,
      cRate = await this.getAttributeValue("CRIT Rate"),
      cDmg = await this.getAttributeValue("CRIT DMG"),
    } = config;
    const bases: CalcFactorBase[] = [];

    for (const base of toArray(config.bases)) {
      bases.push({
        root: await this.getAttributeValue(base.baseOn),
        mult: base.mult,
      });
    }

    return this.calculate({
      bases,
      flat,
      pct,
      specMult,
      defMult,
      resMult,
      cRate,
      cDmg,
    });
  };

  private checkEqual = (value1: number, value2: number) => {
    expect(value1).not.toBeNaN();
    expect(value2).not.toBeNaN();
    expect(Math.abs(value1 - value2)).toBeLessThan(1);
  };

  private checkAttPattResult = async (
    locator: ReturnType<typeof this.getResultLocator>,
    expected: ReturnType<typeof this.calculate>
  ) => {
    const base = await this.getResultValue(locator.baseLct);
    const crit = await this.getResultValue(locator.critLct);
    const avg = await this.getResultValue(locator.avgLct);

    this.checkEqual(base, expected.base);
    this.checkEqual(crit, expected.crit);
    this.checkEqual(avg, expected.avg);
  };

  public testChanges = async (resultConfigs: ResultConfig[], stepConfigs: StepConfig[]) => {
    for (const resultConfig of resultConfigs) {
      const resultLct = this.getResultLocator(resultConfig.section, resultConfig.row);
      const expected = await this.calcAttPatt(resultConfig.calc);

      await this.checkAttPattResult(resultLct, expected);
    }

    for (const stepConfig of stepConfigs) {
      await stepConfig.change?.();

      for (let i = 0; i < resultConfigs.length; i++) {
        const resultConfig = resultConfigs[i];
        const calcChange = stepConfig.calcChanges?.[i];

        if (stepConfig.commonCalcChange || calcChange) {
          const calc = {
            ...resultConfig.calc,
            ...stepConfig.commonCalcChange,
            ...calcChange,
          };

          const resultLct = this.getResultLocator(resultConfig.section, resultConfig.row);
          const expected = await this.calcAttPatt(calc);

          await this.checkAttPattResult(resultLct, expected);
        }
      }
    }
  };
}
