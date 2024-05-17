import { Page, expect } from "@playwright/test";

export async function startSessionWithCharacter(page: Page, name: string, level?: string) {
  await page.goto("/");

  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Select a character" }).click();

  await page.getByTitle(name).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();

  if (level) {
    await page.locator("#calculator_character-level").click();

    await page.getByRole("listbox").getByRole("option", { name: level }).click();
  }
}
