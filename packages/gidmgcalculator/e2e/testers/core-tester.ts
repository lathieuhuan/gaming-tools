import { Page, expect } from "@playwright/test";
import { AttributeStat } from "../../src/backend";

type BuffGroup = "Self buffs";

type SectionLabel = "Normal Attacks" | "Elemental Skill" | "Elemental Burst" | "Reactions DMG";

type ResultAt = {
  section: SectionLabel;
  row: string;
};

type Converter = {
  before?: (value: number) => number;
  after?: (value: number) => number;
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
    await this.page.getByTitle(group).click();
    await this.page.getByRole("checkbox", { name }).check();
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

  checkResultAfterModifier = async (
    resultAt: ResultAt,
    activateModifier: () => Promise<void>,
    converter?: Converter
  ) => {
    const cell = this.getResultCell(resultAt.section, resultAt.row);

    let valueBefore = +(await cell.innerText());

    if (converter?.before) {
      valueBefore = converter.before(valueBefore);
    }

    expect(valueBefore).not.toBeNaN();

    await activateModifier();

    let valueAfter = +(await cell.innerText());

    if (converter?.after) {
      valueAfter = converter.after(valueAfter);
    }
  };
}
