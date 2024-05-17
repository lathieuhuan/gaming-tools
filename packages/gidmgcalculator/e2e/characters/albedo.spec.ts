import { test, expect } from "@playwright/test";
import { startSessionWithCharacter } from "../utils/start-session";

test("has working buffs", async ({ page }) => {
  await startSessionWithCharacter(page, "Albedo", "90/90");

  await page.getByTitle("Self buffs").click();

  const checkbox = page.getByRole("checkbox", { name: "Ascension 1" });

  await expect(checkbox).toBeVisible();
});
