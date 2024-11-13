import { CalcArtifacts } from "@Src/types";
import { ArtifactType, Level } from "@Src/backend/types";
import { characters } from "@Mocks/characters.mock";
import { GeneralCalc } from "../general-calc";

test("getAscension", () => {
  const testCases: Array<{ levels: Level[]; ascension: number }> = [
    {
      levels: ["1/20", "20/20"],
      ascension: 0,
    },
    {
      levels: ["20/40", "40/40"],
      ascension: 1,
    },
    {
      levels: ["40/50", "50/50"],
      ascension: 2,
    },
    {
      levels: ["50/60", "60/60"],
      ascension: 3,
    },
    {
      levels: ["60/70", "70/70"],
      ascension: 4,
    },
    {
      levels: ["70/80", "80/80"],
      ascension: 5,
    },
    {
      levels: ["80/90", "90/90"],
      ascension: 6,
    },
  ];

  for (const testCase of testCases) {
    for (const level of testCase.levels) {
      expect(GeneralCalc.getAscension(level)).toBe(testCase.ascension);
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
