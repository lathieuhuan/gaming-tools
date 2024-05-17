import { test, expect } from "@playwright/test";

test("shows intro", async ({ page }) => {
  await page.goto("/");

  const intro = page.getByRole("dialog");
  const heading = new RegExp("GI DMG Calculator");

  await expect(intro.getByRole("heading", { name: heading })).toBeVisible();

  await intro.getByRole("button", { name: "Close" }).click();

  await expect(intro).not.toBeVisible();
});
