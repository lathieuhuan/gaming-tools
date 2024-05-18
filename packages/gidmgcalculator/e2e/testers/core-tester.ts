import { Locator, Page, expect } from "@playwright/test";

type BuffGroup = "Self buffs";

type SectionLabel = "Normal Attacks" | "Elemental Skill" | "Elemental Burst";

export type CalcFactor = {
  root: number;
  mult: number;
  flat: number;
  pct: number;
  specMult: number;
  defMult: number;
  resMult: number;
  cRate: number;
  cDmg: number;
};

type CalcAttPattConfig = Pick<CalcFactor, "mult"> &
  Partial<Pick<CalcFactor, "flat" | "pct" | "specMult" | "defMult" | "resMult" | "cRate" | "cDmg">> & {
    baseOn: "HP" | "ATK" | "DEF" | "Elemental Mastery";
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

  protected activateBuff = async (group: BuffGroup, name: string) => {
    const collapseTrigger = this.page.getByTitle(group);
    const isExpanded = await collapseTrigger.getAttribute("aria-expanded");

    if (isExpanded !== "true") {
      await collapseTrigger.click();
    }

    const control = this.page.getByRole("checkbox", { name });
    await control.check();
    return control;
  };

  getAttributeLocator = (attribute: string) => {
    const cell = this.attributeTable.getByRole("row", { name: attribute }).getByRole("cell").nth(1);

    if (["HP", "ATK", "DEF"].includes(attribute)) {
      return cell.getByRole("paragraph").first();
    }
    return cell;
  };

  async getAttributeValue(attribute: string): Promise<number>;
  async getAttributeValue(locator: Locator): Promise<number>;
  async getAttributeValue(arg: string | Locator): Promise<number> {
    const locator = typeof arg === "string" ? this.getAttributeLocator(arg) : arg;
    return +(await locator.innerText()).replace(/%/g, "");
  }

  getResultLocator = (sectionLabel: SectionLabel, rowLabel: string) => {
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

  getResultValue = async (cellLct: Locator) => {
    return +(await cellLct.innerText());
  };

  getResultValues = async (cellLct: Locator) => {
    const text = await cellLct.innerText();
    return text.split(" + ").map((n) => +n);
  };

  calculate = (factor: CalcFactor) => {
    const base =
      (factor.root * (factor.mult / 100) + factor.flat) *
      (factor.pct / 100) *
      factor.specMult *
      factor.defMult *
      factor.resMult;
    const cDmg = factor.cDmg / 100;
    const cRate = factor.cRate / 100;

    return {
      base,
      crit: base * (1 + cDmg),
      avg: base * (1 + cDmg * cRate),
    };
  };

  calcAttPatt = async (config: CalcAttPattConfig) => {
    const {
      mult,
      flat = 0,
      pct = 100,
      specMult = 1,
      defMult = 0.653,
      resMult = 0.9,
      cRate = await this.getAttributeValue("CRIT Rate"),
      cDmg = await this.getAttributeValue("CRIT DMG"),
    } = config;
    const root = await this.getAttributeValue(config.baseOn);

    return this.calculate({
      root,
      mult,
      flat,
      pct,
      specMult,
      defMult,
      resMult,
      cRate,
      cDmg,
    });
  };

  checkEqual = (value1: number, value2: number) => {
    expect(value1).not.toBeNaN();
    expect(value2).not.toBeNaN();
    expect(Math.abs(value1 - value2)).toBeLessThan(value1 / 1000);
  };

  checkAttPattResult = async (
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
}
