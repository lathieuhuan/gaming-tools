import { AttackBonuses } from "@Src/backend/types";
import { AttackBonusesArchive, AttackBonusesControl } from "../attack-bonuses-control";

class Tester extends AttackBonusesControl {
  _expectHas(bonus: AttackBonuses[number]) {
    expect(this["attBonuses"]).toContainEqual(bonus);
  }
}

let tester: Tester;

beforeEach(() => {
  tester = new Tester();
});

test("static: get", () => {
  const allBonuses: AttackBonuses = [
    {
      type: "ES",
      records: [
        { value: 2, toKey: "cRate_", description: "aaa" },
        { value: 4, toKey: "cRate_", description: "bbb" },
        { value: 13, toKey: "pct_", description: "ccc" },
      ],
    },
    {
      type: "EB",
      records: [{ value: 7, toKey: "cRate_", description: "" }],
    },
    {
      type: "anemo",
      records: [
        { value: 11, toKey: "cRate_", description: "ddd" },
        { value: 20, toKey: "cDmg_", description: "" },
      ],
    },
  ];

  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES")).toBe(2 + 4);
  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES", "anemo")).toBe(2 + 4 + 11);
  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES.anemo")).toBe(0);
});

test("add", () => {
  tester.add({ value: 20, toType: "NA", toKey: "pct_", description: "aaa" });
  tester._expectHas({
    type: "NA",
    records: [{ value: 20, toKey: "pct_", description: "aaa" }],
  });

  tester.add({ value: 10, toType: "all", toKey: "cRate_", description: "bbb" });
  tester._expectHas({
    type: "all",
    records: [{ value: 10, toKey: "cRate_", description: "bbb" }],
  });

  tester.add({ value: 35, toType: "spread", toKey: "pct_", description: "ccc" });
  tester._expectHas({
    type: "spread",
    records: [{ value: 35, toKey: "pct_", description: "ccc" }],
  });
});

describe("genArchive: AttackBonusesArchive", () => {
  let archive: AttackBonusesArchive;

  beforeEach(() => {
    tester.add([
      { value: 5, toType: "ES", toKey: "cRate_", description: "" },
      { value: 8, toType: "ES", toKey: "cRate_", description: "" },
      { value: 10, toType: "ES", toKey: "cDmg_", description: "" },
      { value: 15, toType: "pyro", toKey: "cRate_", description: "" },
      { value: 40, toType: "pyro", toKey: "cDmg_", description: "" },
      { value: 20, toType: "ES.pyro", toKey: "cRate_", description: "" },
      { value: 12, toType: "all", toKey: "cRate_", description: "" },
      { value: 18, toType: "id.0", toKey: "pct_", description: "aaa" },
      { value: 31, toType: "id.1", toKey: "pct_", description: "" },
    ]);
    archive = tester.genArchive();
  });

  test("get", () => {
    expect(archive.get("cRate_", "ES")).toBe(5 + 8 + 12);
    expect(archive.get("cRate_", "ES", "pyro")).toBe(5 + 8 + 15 + 12);
    expect(archive.get("cRate_", "ES.pyro")).toBe(20 + 12);
  });

  test("getBare", () => {
    expect(archive.getBare("cRate_", "ES")).toBe(5 + 8);
    expect(archive.getBare("cRate_", "ES", "pyro")).toBe(5 + 8 + 15);
    expect(archive.getBare("cRate_", "ES.pyro")).toBe(20);
  });

  test("getExclusiveBonuses", () => {
    const expected: ReturnType<AttackBonusesArchive["getExclusiveBonuses"]> = [
      {
        type: "pct_",
        records: [{ value: 18, description: "aaa" }],
      },
    ];
    expect(archive.getExclusiveBonuses("id.0")).toEqual(expected);
  });
});
