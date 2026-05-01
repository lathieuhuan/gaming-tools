import { describe, expect, test } from "vitest";

import { ArtifactGear } from "@/models/ArtifactGear";
import { __createMember } from "@/screens/Simulator/__tests__/utils";
import { AttributeControl } from "../AttributeControl";

describe("AttributeControl", () => {
  describe("init", () => {
    test("returns attrs with default combat stats", () => {
      const ctrl = new AttributeControl();
      const member = __createMember();
      const attrs = ctrl.init(member);

      expect(attrs.get("cRate_")).toBe(5);
      expect(attrs.get("cDmg_")).toBe(50);
      expect(attrs.get("er_")).toBe(100);
      expect(attrs.get("naAtkSpd_")).toBe(100);
      expect(attrs.get("caAtkSpd_")).toBe(100);
    });

    test("clears previous init when called again", () => {
      const ctrl = new AttributeControl();
      const withInnate = __createMember({
        dataPatch: {
          statInnates: [{ type: "em", value: 99 }],
        },
      });
      const withoutInnate = __createMember();

      ctrl.init(withInnate);
      expect(ctrl.get("em")).toBe(99);

      ctrl.init(withoutInnate);
      expect(ctrl.get("em")).toBe(0);
    });

    test("applies ascension stat bonus based on ascension level", () => {
      const ctrl = new AttributeControl();
      const member = __createMember({ level: "1/20" });

      ctrl.init(member);
      expect(ctrl.get("atk_")).toBeCloseTo(10.8, 5);

      const highAsc = __createMember({ level: "80/90" });
      ctrl.init(highAsc);
      expect(ctrl.get("atk_")).toBeGreaterThan(10.8);
    });

    test("includes character innate stats", () => {
      const ctrl = new AttributeControl();
      const member = __createMember({
        dataPatch: {
          statInnates: [{ type: "em", value: 33 }],
        },
      });

      ctrl.init(member);
      expect(ctrl.get("em")).toBe(33);
    });

    test("maps artifact base_hp to hp flat", () => {
      const gear = new ArtifactGear();
      gear.attributes.add("base_hp", 400);

      const ctrl = new AttributeControl();
      const member = __createMember({ atfGear: gear });

      ctrl.init(member);
      expect(ctrl.get("hp")).toBe(1000 + 400);
    });

    test("uses lower level growth for 4-star rarity", () => {
      const ctrl = new AttributeControl();
      const fiveStar = __createMember({
        level: "50/60",
        dataPatch: { rarity: 5 },
      });
      const fourStar = __createMember({
        level: "50/60",
        dataPatch: { rarity: 4 },
      });

      ctrl.init(fiveStar);
      const baseHpFive = ctrl.get("hp");

      ctrl.init(fourStar);
      const baseHpFour = ctrl.get("hp");

      expect(baseHpFour).toBeLessThan(baseHpFive);
    });

    test("uses 4-star growth for Traveler regardless of rarity", () => {
      const ctrl = new AttributeControl();
      const traveler = __createMember({
        level: "50/60",
        dataPatch: { name: "Aether Traveler", rarity: 5 },
      });
      const normalFive = __createMember({
        level: "50/60",
        dataPatch: { rarity: 5 },
      });

      ctrl.init(normalFive);
      const normalHp = ctrl.get("hp");

      ctrl.init(traveler);
      const travelerHp = ctrl.get("hp");

      expect(travelerHp).toBeLessThan(normalHp);
    });
  });

  describe("get", () => {
    test("combines base, percent, and flat for core stats", () => {
      const ctrl = new AttributeControl();
      const gear = new ArtifactGear();
      gear.attributes.add("atk_", 20);
      gear.attributes.add("atk", 30);

      const member = __createMember({ atfGear: gear });
      const attrs = ctrl.init(member);

      const baseAtk = attrs.get("base_atk");
      const atkPct = attrs.get("atk_");
      const expected = baseAtk + (baseAtk * atkPct) / 100 + 30;

      expect(ctrl.get("atk")).toBeCloseTo(expected, 5);
    });

    test("returns stored value for non-core stats", () => {
      const ctrl = new AttributeControl();
      const member = __createMember();
      ctrl.init(member);

      expect(ctrl.get("er_")).toBe(100);
    });
  });

  describe("getCopy", () => {
    test("returns a clone of the current snapshot", () => {
      const ctrl = new AttributeControl();
      const member = __createMember({
        dataPatch: {
          statInnates: [{ type: "em", value: 50 }],
        },
      });
      ctrl.init(member);

      const snapshot = ctrl.getCopy();
      expect(snapshot.get("em")).toBe(50);
    });

    test("the returned clone is independent of later mutations", () => {
      const ctrl = new AttributeControl();
      const member = __createMember();
      ctrl.init(member);

      const snapshot = ctrl.getCopy();
      snapshot.add("em", 999);

      expect(snapshot.get("em")).toBe(999);
      expect(ctrl.get("em")).toBe(0);
    });
  });
});
