import { Page, expect } from "@playwright/test";

export async function selectCharacter(page: Page, name: string) {
  await page.goto("/");

  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "Select a character" }).click();

  await page.getByTitle(name).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();
}
