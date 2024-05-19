import { Page } from "@playwright/test";
import { selectOption } from "./select-option";

export async function gotoPageAndSkipIntro(page: Page) {
  await page.setViewportSize({
    width: 1536,
    height: 703,
  });

  await page.goto("/");

  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
}

export async function startSessionWithCharacter(page: Page, name: string, level?: string, constellation = 0) {
  await page.getByRole("button", { name: "Select a character" }).click();

  await page.getByTitle(name).click();

  if (level) {
    await page.locator("#calculator_character-level").click();

    await selectOption(page, level);
  }

  if (constellation) {
    await page.locator("#calculator_character-constellation").click();

    await selectOption(page, `C${constellation}`);
  }
}
