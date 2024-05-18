import { test } from "@playwright/test";
import { CharacterTester } from "../testers/character-tester";

test("has working buffs", async ({ page }) => {
  const tester = new CharacterTester(page);

  await tester.selectCharacter("Albedo", "90/90", 6);

  // A1
  await tester.checkCalcItemAfterModified(
    "Elemental Skill",
    "Transient Blossom",
    () => tester.activateSelfBuff("Ascension 1"),
    // this attack already increased by 28.8% by Albedo's Geo DMG Bonus at level 90/90
    // (before) => (before / 1.288) * (1.288 + 0.25)
  );

  // A4
  await tester.activateSelfBuff("Ascension 4");
  await tester.checkAttribute("em", 125);

  // C2
  // await tester.checkResultAfterModified(
  //   "Elemental Skill",
  //   "Burst DMG",
  //   () => tester.activateSelfBuff("Constellation 2"),
  //   (before) => (before / 1.288) * (1.288 + 0.25)
  // );
});
