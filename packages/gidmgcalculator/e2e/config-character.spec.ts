import { expect, test } from "@playwright/test";
import gotoPageAndSkipIntro from "./utils/go-to-page-and-skip-intro";
import selectCharacter from "./utils/select-character";
import selectOption  from "./utils/select-option";

test.beforeEach(async ({ page }) => {
  await gotoPageAndSkipIntro(page);
});

test.describe("select character", () => {
  test("it should let me select character", async ({ page }) => {
    await selectCharacter(page, "Albedo");

    await expect(page.getByRole("heading", { name: "Albedo" })).toBeVisible();
  });
});

test("it should let me change character's level", async ({ page }) => {
  await selectCharacter(page, "Albedo");

  const characterLevel = page.getByLabel("calculator_character-level");

  await characterLevel.getByRole("combobox").click();

  await selectOption(page, "90/90");

  await expect(characterLevel.getByText("90/90").and(page.getByTitle("90/90"))).toBeVisible();
});
