import { AttackBonuses, AttackBonusesControl } from "../attack-bonuses-control";

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
        { value: 2, to: "cRate_", desc: "aaa" },
        { value: 4, to: "cRate_", desc: "bbb" },
        { value: 13, to: "pct_", desc: "ccc" },
      ],
    },
    {
      type: "EB",
      records: [{ value: 7, to: "cRate_", desc: "" }],
    },
    {
      type: "anemo",
      records: [
        { value: 11, to: "cRate_", desc: "ddd" },
        { value: 20, to: "cDmg_", desc: "" },
      ],
    },
  ];

  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES")).toBe(2 + 4);
  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES", "anemo")).toBe(2 + 4 + 11);
  expect(AttackBonusesControl.get(allBonuses, "cRate_", "ES.anemo")).toBe(2 + 4 + 11);
});

test("add", () => {
  tester.add({
    value: 2,
    toType: "NA",
    toKey: "pct_",
    description: "abc",
  });

  tester._expectHas({
    type: "NA",
    records: [
      {
        value: 2,
        to: "pct_",
        desc: "abc",
      },
    ],
  });
});
