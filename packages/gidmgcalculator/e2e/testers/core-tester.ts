import { Locator, Page, expect } from "@playwright/test";
import { AttackBonusKey, AttributeStat } from "../../src/backend";

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

export class CoreTester {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getResultCell = (sectionLabel: SectionLabel, rowLabel: string) => {
    return this.page
      .getByRole("table", { name: sectionLabel })
      .getByRole("row", { name: rowLabel })
      .getByRole("cell")
      .nth(1);
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

  private calcCalcItem = (factor: CalcFactor) => {
    const base =
      (factor.root * factor.mult + factor.flat) * factor.pct * factor.specMult * factor.defMult * factor.resMult;
    const cDmg = factor.cDmg / 100;
    const cRate = factor.cRate / 100;

    return {
      base,
      crit: base * (1 + cDmg),
      avr: base * (1 + cDmg * cRate),
    };
  };

  checkAttribute = async (attribute: AttributeStat, value: number) => {
    const table = this.page.getByRole("table", { name: "attribute-table" });

    async function checkRow(rowLabel: string) {
      return await expect(table.getByRole("row", { name: rowLabel }).getByRole("cell").nth(1)).toHaveText(`${value}`);
    }

    switch (attribute) {
      case "em":
        await checkRow("Elemental Mastery");
        break;
    }
  };

  checkCalcItemAfterModified = async (
    section: SectionLabel,
    row: string,
    modify: () => Promise<Locator>,
    // changes: Partial<CalcFactor>
  ) => {
    const cell = this.getResultCell(section, row);

    let valueBefore = +(await cell.innerText());
    expect(valueBefore).not.toBeNaN();

    const control = await modify();
    const valueAfter = +(await cell.innerText());

    expect(valueAfter).not.toBeNaN();
    expect(valueAfter - valueBefore).toBeLessThan(valueBefore * 0.01);

    return control;
  };
}
