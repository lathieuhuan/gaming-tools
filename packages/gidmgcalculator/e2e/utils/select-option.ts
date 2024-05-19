import { Page } from "@playwright/test";

export async function selectOption(page: Page, label: string) {
  await page.getByRole("listbox").getByRole("option", { name: label }).click();
}
