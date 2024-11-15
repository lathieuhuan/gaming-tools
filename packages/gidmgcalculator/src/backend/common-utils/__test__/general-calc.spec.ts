import { ArtifactType } from "@Src/backend/types";
import { CalcArtifacts } from "@Src/types";
import { characters } from "@UnitTest/mocks/characters.mock";
import { ASCENSION_RANKS } from "@UnitTest/test-constants";
import { GeneralCalc } from "../general-calc";

test("getAscension", () => {
  for (const testCase of ASCENSION_RANKS) {
    for (const level of testCase.levels) {
      expect(GeneralCalc.getAscension(level)).toBe(testCase.value);
    }
  }
});

describe("getArtifactSetBonuses", () => {
  let id = 0;

  function makeArtifact(code: number, type: ArtifactType): NonNullable<CalcArtifacts[number]> {
    return {
      ID: id++,
      code,
      type,
      level: 1,
      mainStatType: "atk_",
      rarity: 5,
      subStats: [],
    };
  }

  test("no artifacts", () => {
    expect(GeneralCalc.getArtifactSetBonuses()).toHaveLength(0);
  });

  test("one 2-set bonus", () => {
    const artifacts: CalcArtifacts = [makeArtifact(1, "flower"), makeArtifact(1, "plume")];
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

    expect(setBonuses).toHaveLength(1);
    expect(setBonuses[0]).toEqual({ code: 1, bonusLv: 0 });
  });

  test("two 2-set bonuses", () => {
    const artifacts: CalcArtifacts = [
      makeArtifact(1, "flower"),
      makeArtifact(1, "plume"),
      makeArtifact(2, "sands"),
      makeArtifact(2, "goblet"),
      null,
    ];
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

    expect(setBonuses).toHaveLength(2);
    expect(setBonuses[0]).toEqual({ code: 1, bonusLv: 0 });
    expect(setBonuses[1]).toEqual({ code: 2, bonusLv: 0 });
  });

  test("one 4-set bonus", () => {
    const artifacts: CalcArtifacts = [
      makeArtifact(3, "flower"),
      makeArtifact(3, "plume"),
      null,
      makeArtifact(3, "goblet"),
      makeArtifact(3, "circlet"),
    ];
    const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

    expect(setBonuses).toHaveLength(1);
    expect(setBonuses[0]).toEqual({ code: 3, bonusLv: 1 });
  });
});

describe("countElements", () => {
  test("without appChar", () => {
    const elmtCounter = GeneralCalc.countElements([characters[0], characters[1]]);

    expect(elmtCounter.get(characters[0].vision)).toBe(1);
    expect(elmtCounter.get(characters[1].vision)).toBe(1);
  });

  test("with appChar", () => {
    const elmtCounter = GeneralCalc.countElements([characters[0], characters[0]], characters[2]);

    expect(elmtCounter.get(characters[0].vision)).toBe(2);
    expect(elmtCounter.get(characters[2].vision)).toBe(1);
  });
});
