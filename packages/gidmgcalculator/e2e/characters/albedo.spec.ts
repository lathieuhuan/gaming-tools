import { expect, test } from "@playwright/test";
import { CharacterTester } from "../testers/character-tester";
import { gotoPageAndSkipIntro } from "../utils/start-session";

test("modifiers", async ({ page }) => {
  await gotoPageAndSkipIntro(page);
  const tester = new CharacterTester(page);
  await tester.selectCharacter("Albedo", "90/90", 6);

  await testA1(tester);
  await testA4(tester);
  await testC2(tester);
  await testC4(tester);
});

async function testA1(tester: CharacterTester) {
  const resultLct = tester.getResultLocator("Elemental Skill", "Transient Blossom");
  const expectedBefore = await tester.calcAttPatt({
    baseOn: "DEF",
    mult: 167,
    pct: 128.8,
  });

  await tester.checkAttPattResult(resultLct, expectedBefore);

  await tester.activateBuff("Self buffs", "Ascension 1");

  const expectedAfter = await tester.calcAttPatt({
    baseOn: "DEF",
    mult: 167,
    pct: 128.8 + 25,
  });

  await tester.checkAttPattResult(resultLct, expectedAfter);
}

async function testA4(tester: CharacterTester) {
  await tester.activateBuff("Self buffs", "Ascension 4");

  expect(await tester.getAttributeValue("Elemental Mastery")).toBe(125);
}

async function testC2(tester: CharacterTester) {
  // #to-do: also test Fatal Blossom DMG
  const resultLct = tester.getResultLocator("Elemental Burst", "Burst DMG");
  const expectedBefore = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 459,
    pct: 128.8,
  });

  await tester.checkAttPattResult(resultLct, expectedBefore);

  await tester.activateBuff("Self buffs", "Constellation 2");

  const def = await tester.getAttributeValue("DEF");

  const expectedAfter = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 459,
    pct: 128.8,
    flat: def * 0.3,
  });

  await tester.checkAttPattResult(resultLct, expectedAfter);

  await tester.changeModInput("Self buffs / Constellation 2", "Stacks", "select", "4");

  const newExpectedAfter = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 459,
    pct: 128.8,
    flat: def * 1.2,
  });

  await tester.checkAttPattResult(resultLct, newExpectedAfter);
}

async function testC4(tester: CharacterTester) {
  const resultLct = tester.getResultLocator("Normal Attacks", "Plunge DMG");
  const expectedBefore = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 63.93,
  });

  await tester.checkAttPattResult(resultLct, expectedBefore);

  await tester.activateBuff("Self buffs", "Constellation 4");

  const expectedAfter = await tester.calcAttPatt({
    baseOn: "ATK",
    mult: 63.93,
    pct: 130,
  });

  await tester.checkAttPattResult(resultLct, expectedAfter);
}
