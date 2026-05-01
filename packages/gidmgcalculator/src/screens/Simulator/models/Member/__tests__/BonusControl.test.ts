import { describe, expect, test } from "vitest";

import { BonusControl } from "../BonusControl";
import type { BonusGroupMeta } from "../types";

const meta = (id: string): BonusGroupMeta => ({ id, src: "test" });

describe("BonusControl", () => {
  describe("addAttrBonus", () => {
    test("aggregates values from different groups for the same stat", () => {
      const bc = new BonusControl();
      bc.addAttrBonus(meta("a"), {
        type: "ATTR",
        groupId: "a",
        value: 10,
        toStat: "em",
      });
      bc.addAttrBonus(meta("b"), {
        type: "ATTR",
        groupId: "b",
        value: 5,
        toStat: "em",
      });

      expect(bc.totalAttrBonus("em")).toBe(15);
    });

    test("replaces value when the same group and stat are added again", () => {
      const bc = new BonusControl();
      const m = meta("g1");
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "g1",
        value: 10,
        toStat: "atk_",
      });
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "g1",
        value: 4,
        toStat: "atk_",
      });

      expect(bc.totalAttrBonus("atk_")).toBe(4);
    });

    test("stores one groups entry with meta, ids, and bonuses keyed by meta.id", () => {
      const bc = new BonusControl();
      const m = meta("src-a");
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "grp1",
        value: 7,
        toStat: "em",
      });

      expect(bc.groups.size).toBe(1);
      const g = bc.groups.get("src-a");
      expect(g?.meta).toEqual(m);
      expect([...g!.ids]).toEqual(["grp1-em"]);
      expect(g?.bonuses).toHaveLength(1);
      expect(g?.bonuses[0]).toMatchObject({
        type: "ATTR",
        groupId: "grp1",
        value: 7,
        toStat: "em",
      });
    });

    test("accumulates distinct bonus ids in the same meta group", () => {
      const bc = new BonusControl();
      const m = meta("one-meta");
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "x",
        value: 1,
        toStat: "em",
      });
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "x",
        value: 2,
        toStat: "atk_",
      });

      const g = bc.groups.get("one-meta");
      expect(g?.ids.size).toBe(2);
      expect([...g!.ids].sort()).toEqual(["x-atk_", "x-em"]);
      expect(g?.bonuses).toHaveLength(2);
    });

    test("does not append a second bonus when the same attr bonus id is added again", () => {
      const bc = new BonusControl();
      const m = meta("dedupe");
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "g",
        value: 10,
        toStat: "hp_",
      });
      bc.addAttrBonus(m, {
        type: "ATTR",
        groupId: "g",
        value: 50,
        toStat: "hp_",
      });

      const g = bc.groups.get("dedupe");
      expect(g?.bonuses).toHaveLength(1);
      expect(g?.ids.size).toBe(1);
      expect(g?.bonuses[0].value).toBe(50);
    });
  });

  describe("totalAttrBonus", () => {
    test("omits dynamic bonuses when fixedOnly is true", () => {
      const bc = new BonusControl();
      bc.addAttrBonus(meta("x"), {
        type: "ATTR",
        groupId: "x",
        value: 100,
        toStat: "hp_",
        isDynamic: true,
      });

      expect(bc.totalAttrBonus("hp_", true)).toBe(0);
      expect(bc.totalAttrBonus("hp_", false)).toBe(100);
    });

    test("counts non-dynamic bonuses regardless of fixedOnly", () => {
      const bc = new BonusControl();
      bc.addAttrBonus(meta("y"), {
        type: "ATTR",
        groupId: "y",
        value: 12,
        toStat: "def_",
      });

      expect(bc.totalAttrBonus("def_", true)).toBe(12);
      expect(bc.totalAttrBonus("def_", false)).toBe(12);
    });

    test("returns 0 when no bonuses exist for the stat", () => {
      const bc = new BonusControl();
      expect(bc.totalAttrBonus("er_")).toBe(0);
    });
  });

  describe("addAttkBonus and totalAttkBonus", () => {
    test("sums matching toKey across the given paths", () => {
      const bc = new BonusControl();
      const m = meta("atk");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "g1",
        value: 10,
        toType: "all",
        toKey: "pct_",
      });
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "g2",
        value: 7,
        toType: "NA",
        toKey: "pct_",
      });

      expect(bc.totalAttkBonus("pct_", ["all", "NA"])).toBe(17);
    });

    test("ignores bonuses whose toKey does not match", () => {
      const bc = new BonusControl();
      const m = meta("m");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "g",
        value: 99,
        toType: "all",
        toKey: "flat",
      });

      expect(bc.totalAttkBonus("pct_", ["all"])).toBe(0);
    });

    test("treats null, undefined, and false path entries as empty", () => {
      const bc = new BonusControl();
      const m = meta("p");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "g",
        value: 5,
        toType: "all",
        toKey: "cRate_",
      });

      expect(bc.totalAttkBonus("cRate_", [null, undefined, false, "all"])).toBe(5);
    });

    test("stores one groups entry with attack bonus id groupId-toType-toKey", () => {
      const bc = new BonusControl();
      const m = meta("attk-src");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "wg",
        value: 15,
        toType: "all",
        toKey: "pct_",
      });

      expect(bc.groups.size).toBe(1);
      const g = bc.groups.get("attk-src");
      expect(g?.meta).toEqual(m);
      expect([...g!.ids]).toEqual(["wg-all-pct_"]);
      expect(g?.bonuses).toHaveLength(1);
      expect(g?.bonuses[0]).toMatchObject({
        type: "ATTK",
        groupId: "wg",
        value: 15,
        toType: "all",
        toKey: "pct_",
      });
    });

    test("does not append a second bonus when the same attack bonus id is added again", () => {
      const bc = new BonusControl();
      const m = meta("attk-dedupe");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "k",
        value: 3,
        toType: "NA",
        toKey: "flat",
      });
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "k",
        value: 9,
        toType: "NA",
        toKey: "flat",
      });

      const g = bc.groups.get("attk-dedupe");
      expect(g?.bonuses).toHaveLength(1);
      expect(g?.ids.size).toBe(1);
      expect(g?.bonuses[0].value).toBe(9);
    });
  });

  describe("addInnateBonusGroup", () => {
    test("adds the group to the innateGroups map", () => {
      const bc = new BonusControl();
      bc.addInnateBonusGroup({
        meta: meta("innate-src"),
        bonuses: [
          { type: "ATTR", groupId: "ig", value: 20, toStat: "em" },
          { type: "ATTK", groupId: "ig", value: 15, toType: "all", toKey: "pct_" },
        ],
      });

      expect(bc.innateGroups.size).toBe(1);
      const g = bc.innateGroups.get("innate-src");
      expect(g?.meta).toEqual(meta("innate-src"));
      expect([...g!.ids]).toEqual(["ig-em", "ig-all-pct_"]);
      expect(g?.bonuses).toHaveLength(2);
    });

    test("populates attrRecord and attkRecord from the group bonuses", () => {
      const bc = new BonusControl();
      bc.addInnateBonusGroup({
        meta: meta("innate-src"),
        bonuses: [
          { type: "ATTR", groupId: "ig", value: 20, toStat: "em" },
          { type: "ATTK", groupId: "ig", value: 15, toType: "all", toKey: "pct_" },
        ],
      });

      expect(bc.totalAttrBonus("em", false)).toBe(20);
      expect(bc.totalAttkBonus("pct_", ["all"])).toBe(15);
    });

    test("deduplicates bonuses with the same id within the group", () => {
      const bc = new BonusControl();
      bc.addInnateBonusGroup({
        meta: meta("dup"),
        bonuses: [
          { type: "ATTR", groupId: "g", value: 10, toStat: "hp_" },
          { type: "ATTR", groupId: "g", value: 99, toStat: "hp_" },
        ],
      });

      expect(bc.totalAttrBonus("hp_", false)).toBe(10);
    });

    test("does not add the group to the public groups map", () => {
      const bc = new BonusControl();
      bc.addInnateBonusGroup({
        meta: meta("hidden"),
        bonuses: [
          {
            type: "ATTR",
            groupId: "g",
            value: 5,
            toStat: "em",
          },
        ],
      });

      expect(bc.groups.has("hidden")).toBe(false);
    });
  });

  describe("reset", () => {
    test("clears groups, attrRecord, and attkRecord", () => {
      const bc = new BonusControl();
      bc.addAttrBonus(meta("a"), {
        type: "ATTR",
        groupId: "a",
        value: 10,
        toStat: "em",
      });
      bc.addAttkBonus(meta("b"), {
        type: "ATTK",
        groupId: "b",
        value: 5,
        toType: "all",
        toKey: "pct_",
      });

      bc.reset();

      expect(bc.groups.size).toBe(0);
      expect(bc.totalAttrBonus("em", false)).toBe(0);
      expect(bc.totalAttkBonus("pct_", ["all"])).toBe(0);
    });

    test("re-applies innate bonuses after clearing", () => {
      const bc = new BonusControl();
      bc.addInnateBonusGroup({
        meta: meta("innate"),
        bonuses: [
          {
            type: "ATTR",
            groupId: "ig",
            value: 30,
            toStat: "def_",
          },
        ],
      });
      bc.addAttrBonus(meta("extra"), {
        type: "ATTR",
        groupId: "extra",
        value: 70,
        toStat: "def_",
      });

      expect(bc.totalAttrBonus("def_", false)).toBe(100);

      bc.reset();

      expect(bc.totalAttrBonus("def_", false)).toBe(30);
      expect(bc.groups.size).toBe(0);
    });
  });

  describe("collectExclusiveBonuses", () => {
    test("returns an empty array when id is omitted", () => {
      const bc = new BonusControl();
      bc.addAttkBonus(meta("z"), {
        type: "ATTK",
        groupId: "z",
        value: 1,
        toType: "id.0",
        toKey: "pct_",
      });

      expect(bc.collectExclusiveBonuses()).toEqual([]);
    });

    test("returns an empty array when no attack bonuses exist for that id", () => {
      const bc = new BonusControl();
      expect(bc.collectExclusiveBonuses("id.9")).toEqual([]);
    });

    test("groups records by toKey and wraps values as exclusive items", () => {
      const bc = new BonusControl();
      const m = meta("talent");
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "a",
        value: 11,
        toType: "id.0",
        toKey: "pct_",
      });
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "b",
        value: 22,
        toType: "id.0",
        toKey: "pct_",
      });
      bc.addAttkBonus(m, {
        type: "ATTK",
        groupId: "c",
        value: 33,
        toType: "id.0",
        toKey: "flat",
      });

      const result = bc.collectExclusiveBonuses("id.0");

      expect(result).toHaveLength(2);
      const pct = result.find((g) => g.type === "pct_");
      const flat = result.find((g) => g.type === "flat");
      expect(pct?.items).toEqual([
        { value: 11, label: "record.label" },
        { value: 22, label: "record.label" },
      ]);
      expect(flat?.items).toEqual([{ value: 33, label: "record.label" }]);
    });
  });
});
