import { test } from "@playwright/test";
import { CharacterTester } from "../testers/character-tester";

test("has working buffs", async ({ page }) => {
  const tester = new CharacterTester(page);

  await tester.selectCharacter("Albedo", "90/90");

  // A1
  tester.checkResultAfterModifier(
    {
      section: "Elemental Skill",
      row: "Transient Blossom",
    },
    () => tester.activateSelfBuff("Ascension 1")
  );

  // A4
  await tester.activateSelfBuff("Ascension 4");
  await tester.checkAttribute("em", 125);
});
