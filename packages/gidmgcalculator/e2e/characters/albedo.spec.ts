import { Page, expect, test } from "@playwright/test";
import { CharacterTester } from "../testers/character-tester";
import { gotoPageAndSkipIntro } from "../utils/start-session";

let page: Page;
let tester: CharacterTester;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  tester = new CharacterTester(page);
  await gotoPageAndSkipIntro(page);
});

test.afterAll(async () => {
  await page.close();
});

test.beforeEach(async () => {
  await tester.selectCharacter("Albedo", "90/90", 6);
});

test("A1 buff", async () => {
  const resultLct = tester.getResultLocator("Elemental Skill", "Transient Blossom");
  const expectedBefore = await tester.calcAttPatt({
    baseOn: "DEF",
    mult: 167,
    pct: 128.8,
  });

  await tester.checkAttPattResult(resultLct, expectedBefore);

  await tester.activateSelfBuff("Ascension 1");

  const expectedAfter = await tester.calcAttPatt({
    baseOn: "DEF",
    mult: 167,
    pct: 128.8 + 25,
  });

  await tester.checkAttPattResult(resultLct, expectedAfter);
});

test("A4 buff", async () => {
  await tester.activateSelfBuff("Ascension 4");

  expect(await tester.getAttributeValue("Elemental Mastery")).toBe(125);
});

test("C2 buff", async () => {
  const resultLct = tester.getResultLocator("Elemental Burst", "Burst DMG");
  const expectedBefore = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 459,
    pct: 128.8,
  });

  await tester.checkAttPattResult(resultLct, expectedBefore);

  await tester.activateSelfBuff("Constellation 2");

  const def = await tester.getAttributeValue("DEF");

  const expectedAfter = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 459,
    pct: 128.8,
    flat: def * 0.3,
  });

  await tester.checkAttPattResult(resultLct, expectedAfter);
});
