import { Page } from "@playwright/test";

export default async function gotoPageAndSkipIntro(page: Page) {
  // await page.setViewportSize({
  //   width: 1536,
  //   height: 703,
  // });

  await page.goto("/");

  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
}
