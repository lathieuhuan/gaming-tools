import { Page } from "@playwright/test";

export default async function selectCharacter(page: Page, name: string) {
  await page.getByRole("button", { name: "Select a character" }).click();

  await page.getByTitle(name).click();
}
