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
  await tester.testChanges(
    [
      {
        section: "Elemental Skill",
        row: "Transient Blossom",
        calc: {
          bases: { baseOn: "DEF", mult: 167 },
          pct: 128.8,
        },
      },
    ],
    [
      {
        change: () => tester.activateBuff("Self buffs", "Ascension 1"),
        commonCalcChange: {
          pct: 128.8 + 25,
        },
      },
    ]
  );
}

async function testA4(tester: CharacterTester) {
  await tester.activateBuff("Self buffs", "Ascension 4");

  expect(await tester.getAttributeValue("Elemental Mastery")).toBe(125);
}

async function testC2(tester: CharacterTester) {
  const def = await tester.getAttributeValue("DEF");

  await tester.testChanges(
    [
      {
        section: "Elemental Burst",
        row: "Burst DMG",
        calc: {
          bases: { baseOn: "ATK", mult: 459 },
          pct: 128.8,
        },
      },
      {
        section: "Elemental Burst",
        row: "Fatal Blossom DMG",
        calc: {
          bases: { baseOn: "ATK", mult: 90.0 },
          pct: 128.8,
        },
      },
    ],
    [
      {
        change: () => tester.activateBuff("Self buffs", "Constellation 2"),
        commonCalcChange: {
          flat: def * 0.3,
        },
      },
      {
        change: () => tester.changeModInput("Self buffs / Constellation 2", "Stacks", "select", "4"),
        commonCalcChange: {
          flat: def * 1.2,
        },
      },
    ]
  );
}

async function testC4(tester: CharacterTester) {
  await tester.testChanges(
    [
      {
        section: "Normal Attacks",
        row: "Plunge DMG",
        calc: {
          bases: { baseOn: "ATK", mult: 63.93 },
        },
      },
      {
        section: "Normal Attacks",
        row: "Low Plunge",
        calc: {
          bases: { baseOn: "ATK", mult: 127.84 },
        },
      },
      {
        section: "Normal Attacks",
        row: "High Plunge",
        calc: {
          bases: { baseOn: "ATK", mult: 159.68 },
        },
      },
    ],
    [
      {
        change: () => tester.activateBuff("Self buffs", "Constellation 4"),
        commonCalcChange: {
          pct: 130,
        },
      },
    ]
  );
}
