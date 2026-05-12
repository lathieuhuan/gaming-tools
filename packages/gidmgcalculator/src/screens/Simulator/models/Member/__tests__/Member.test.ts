import { describe, expect, test, vi } from "vitest";

import { CORE_STAT_TYPES } from "@/constants";
import { createWeapon } from "@/logic/entity.logic";
import { ArtifactGear } from "@/models/ArtifactGear";
import { $AppCharacter } from "@/services";
import type { AllAttributeStat } from "@/types";

import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { __appCharacterMock } from "@/__tests__/utils/appCharacterMock";
import { __createMember } from "../../../__tests__/utils";
import { AttributeControl } from "../AttributeControl";
import { BonusControl } from "../BonusControl";
import { Member } from "../Member";
import { MemberState } from "../MemberState";
import type { BonusGroupMeta } from "../types";

const bonusMeta = (id: string): BonusGroupMeta => ({ id, src: "test" });

describe("Member", () => {
  describe("constructor", () => {
    test("sets code from character data and wires weapon and default controls", () => {
      const member = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });

      expect(member.code).toBe(CharacterMock.PYRO_SWORD_HEXEREI);
      expect(member.weapon.data.type).toBe(member.data.weaponType);
      expect(member.atfGear).toBeInstanceOf(ArtifactGear);
      expect(member.attrsCtrl).toBeInstanceOf(AttributeControl);
      expect(member.bonusCtrl).toBeInstanceOf(BonusControl);
    });

    test("sets isTraveler when character name ends with Traveler", () => {
      const travelerData = __appCharacterMock(999, { name: "Anemo Traveler" });
      const otherData = __appCharacterMock(998, { name: "Amber" });

      const travelerMember = new Member(
        travelerData.code,
        travelerData,
        createWeapon({ type: travelerData.weaponType })
      );
      const otherMember = new Member(
        otherData.code,
        otherData,
        createWeapon({ type: otherData.weaponType })
      );

      expect(travelerMember.isTraveler).toBe(true);
      expect(otherMember.isTraveler).toBe(false);
    });

    test("uses injected AttributeControl, BonusControl, and ArtifactGear when provided", () => {
      const data = $AppCharacter.get(CharacterMock.PYRO_SWORD_HEXEREI);
      if (!data) {
        throw new Error("Test setup requires populated $AppCharacter");
      }
      const weapon = createWeapon({ type: data.weaponType });
      const atfGear = new ArtifactGear();
      const attrsCtrl = new AttributeControl();
      const bonusCtrl = new BonusControl();

      const member = new Member(data.code, data, weapon, {
        state: { level: "20/40", NAs: 4 },
        atfGear,
        attrsCtrl,
        bonusCtrl,
      });

      expect(member.attrsCtrl).toBe(attrsCtrl);
      expect(member.bonusCtrl).toBe(bonusCtrl);
      expect(member.atfGear).toBe(atfGear);
      expect(member.state.NAs).toBe(4);
    });
  });

  describe("FlatGetters state delegation", () => {
    test("exposes level, talents, cons, enhanced, bareLv, and ascension from state", () => {
      const member = __createMember({ level: "80/90" });
      member.state.update({ NAs: 8, ES: 7, EB: 6, cons: 4, enhanced: true });

      expect(member.level).toBe("80/90");
      expect(member.NAs).toBe(8);
      expect(member.ES).toBe(7);
      expect(member.EB).toBe(6);
      expect(member.cons).toBe(4);
      expect(member.enhanced).toBe(true);
      expect(member.bareLv).toBe(member.state.bareLv);
      expect(member.ascension).toBe(member.state.ascension);
    });
  });

  describe("baseRxnDamage", () => {
    test("uses BASE_REACTION_DAMAGE for the current bare level", () => {
      const member = __createMember({ level: "90/90" });
      expect(member.baseRxnDamage).toBe(1446.85);
    });

    test("returns 0 when bare level is missing from the reaction damage table", () => {
      const member = __createMember({ level: "90/90" });
      member.state.bareLv = 2;
      expect(member.baseRxnDamage).toBe(0);
    });
  });

  describe("getTotalXtraTalentLv", () => {
    test("adds 3 when constellation meets talentLvBonus threshold for that talent", () => {
      const lowCons = __createMember({
        dataPatch: { talentLvBonus: { ES: 3 } },
      });
      const highCons = __createMember({
        dataPatch: { talentLvBonus: { ES: 3 } },
      });
      lowCons.state.update({ cons: 2 });
      highCons.state.update({ cons: 3 });

      expect(lowCons.getTotalXtraTalentLv("ES")).toBe(0);
      expect(highCons.getTotalXtraTalentLv("ES")).toBe(3);
    });
  });

  describe("getFinalTalentLv", () => {
    test("returns displayed talent level plus extra levels from cons and tllv bonuses", () => {
      const member = __createMember({
        dataPatch: { talentLvBonus: { NAs: 1 } },
      });
      member.state.update({ NAs: 10, cons: 1 });
      member.bonusCtrl.addInnateBonus(bonusMeta("x"), {
        type: "TLLV",
        groupId: "x",
        value: 2,
        toType: "NAs",
      });

      expect(member.getFinalTalentLv("NAs")).toBe(15);
    });
  });

  describe("getQuickenDamageBonus", () => {
    test("computes rounded aggravate damage using base reaction damage and pct_ attack bonuses", () => {
      const member = __createMember({ level: "90/90" });
      member.bonusCtrl.addAttkBonus(bonusMeta("g"), {
        type: "ATTK",
        groupId: "g",
        value: 10,
        toType: "aggravate",
        toKey: "pct_",
      });

      expect(member.getQuickenDamageBonus("aggravate")).toBe(1830);
    });

    test("uses spread multiplier on base damage", () => {
      const member = __createMember({ level: "90/90" });
      expect(member.getQuickenDamageBonus("spread")).toBe(1809);
    });
  });

  describe("getAmplifyingMult", () => {
    test("applies melt multipliers by attacking element and pct_ bonuses", () => {
      const member = __createMember();
      member.bonusCtrl.addAttkBonus(bonusMeta("m"), {
        type: "ATTK",
        groupId: "m",
        value: 50,
        toType: "melt",
        toKey: "pct_",
      });

      expect(member.getAmplifyingMult("melt", "pyro")).toBe(3);
      expect(member.getAmplifyingMult("melt", "cryo")).toBeCloseTo(2.25);
      expect(member.getAmplifyingMult("melt", "hydro")).toBe(1.5);
    });

    test("applies vaporize multipliers by attacking element", () => {
      const member = __createMember();

      expect(member.getAmplifyingMult("vaporize", "pyro")).toBe(1.5);
      expect(member.getAmplifyingMult("vaporize", "hydro")).toBe(2);
      expect(member.getAmplifyingMult("vaporize", "cryo")).toBe(1);
    });
  });

  describe("getAttr", () => {
    test("delegates to AttributeControl.finals.get", () => {
      const member = __createMember();
      const spy = vi.spyOn(member.attrsCtrl.finals, "get").mockReturnValue(99);

      expect(member.getAttr("em")).toBe(99);
      expect(spy).toHaveBeenCalledWith("em");
    });
  });

  describe("initCalculation", () => {
    test("reinitializes attrs, replaces BonusControl, and returns this", () => {
      const member = __createMember({ level: "80/90" });
      const prevBonus = member.bonusCtrl;
      member.bonusCtrl.addAttrBonus(bonusMeta("pre"), {
        type: "ATTR",
        groupId: "pre",
        value: 1,
        toStat: "em",
      });

      const initSpy = vi.spyOn(member.attrsCtrl, "init");

      const ret = member.initCalculation();

      expect(ret).toBe(member);
      expect(initSpy).toHaveBeenCalledWith(member);
      expect(member.bonusCtrl).not.toBe(prevBonus);
      expect(member.bonusCtrl.groups.size).toBe(0);
    });
  });

  describe("resetCalculation", () => {
    test("calls BonusControl.reset and returns this", () => {
      const member = __createMember();
      member.bonusCtrl.addAttrBonus(bonusMeta("pre"), {
        type: "ATTR",
        groupId: "pre",
        value: 5,
        toStat: "em",
      });

      const resetSpy = vi.spyOn(member.bonusCtrl, "reset");
      const prevBonus = member.bonusCtrl;

      const ret = member.resetCalculation();

      expect(ret).toBe(member);
      expect(member.bonusCtrl).toBe(prevBonus);
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe("finalizeAttrs", () => {
    test("merges attribute bonuses into finals and applies core stat formula", () => {
      const member = __createMember({ level: "80/90" });
      member.attrsCtrl.init(member);
      const baseEm = member.attrsCtrl.getCopy().get("em");
      member.bonusCtrl.addAttrBonus(bonusMeta("art"), {
        type: "ATTR",
        groupId: "art",
        value: 100,
        toStat: "em",
      });

      const finals = member.finalizeAttrs();

      expect(finals.get("em")).toBe(baseEm + 100);
      expect(member.attrsCtrl.finals).toBe(finals);
    });

    test("for hp, atk, and def adds base*(1+pct/100) using bases and percents after merging attr bonuses", () => {
      const member = __createMember({ level: "80/90" });
      member.attrsCtrl.init(member);
      member.bonusCtrl.addAttrBonus(bonusMeta("pct"), {
        type: "ATTR",
        groupId: "pct",
        value: 12,
        toStat: "atk_",
      });
      member.bonusCtrl.addAttrBonus(bonusMeta("flat"), {
        type: "ATTR",
        groupId: "flat",
        value: 111,
        toStat: "hp",
      });

      const expected = member.attrsCtrl.getCopy();
      for (const [stat, bonuses] of Object.entries(member.bonusCtrl.attrRecord)) {
        if (!bonuses?.length) continue;
        for (const bonus of bonuses) {
          expected.add(stat as AllAttributeStat, bonus.value);
        }
      }
      for (const stat of CORE_STAT_TYPES) {
        const base = expected.get(`base_${stat}`);
        const pct = expected.get(`${stat}_`);
        expected.add(stat, base + (base * pct) / 100);
      }

      const finals = member.finalizeAttrs();

      for (const stat of CORE_STAT_TYPES) {
        expect(finals.get(stat)).toBe(expected.get(stat));
      }
    });
  });

  describe("serialize", () => {
    test("returns the same shape as static serialize for the member fields", () => {
      const member = __createMember();
      member.state.update({
        level: "70/80",
        NAs: 6,
        ES: 5,
        EB: 4,
        cons: 2,
        enhanced: true,
      });

      expect(member.serialize()).toEqual(Member.serialize(member));
    });
  });

  describe("clone", () => {
    test("creates a new Member copying state data into a fresh MemberState", () => {
      const member = __createMember();
      member.state.update({ NAs: 9, cons: 3 });
      const cloned = member.clone();

      expect(cloned).not.toBe(member);
      expect(cloned.code).toBe(member.code);
      expect(cloned.data).toBe(member.data);
      expect(cloned.state).not.toBe(member.state);
      expect(cloned.state).toStrictEqual(member.state);
      expect(cloned.weapon).toBe(member.weapon);
      expect(cloned.attrsCtrl).toBe(member.attrsCtrl);
    });

    test("substitutes weapon or controls when options override them; state is re-wrapped", () => {
      const member = __createMember();
      const newWeapon = createWeapon({ type: member.data.weaponType });
      const newState = new MemberState({ level: "50/60", NAs: 11 });
      const newAttrs = new AttributeControl();

      const cloned = member.clone({
        weapon: newWeapon,
        state: newState,
        attrsCtrl: newAttrs,
      });

      expect(cloned.weapon).toBe(newWeapon);
      expect(cloned.state).not.toBe(newState);
      expect(cloned.state).toStrictEqual(newState);
      expect(cloned.attrsCtrl).toBe(newAttrs);
    });
  });

  describe("static getTalentMult", () => {
    test("returns 1 when scale is 0", () => {
      expect(Member.getTalentMult(0, 10)).toBe(1);
    });

    test("returns the configured multiplier row for the scale and talent level", () => {
      expect(Member.getTalentMult(1, 3)).toBe(1.16);
      expect(Member.getTalentMult(2, 0)).toBe(0);
    });

    test("returns 0 when scale or level is out of range", () => {
      expect(Member.getTalentMult(99, 1)).toBe(0);
      expect(Member.getTalentMult(1, 99)).toBe(0);
    });
  });

  describe("static serialize", () => {
    test("picks code, level, talents, cons, and enhanced flag", () => {
      const raw = {
        code: 7,
        level: "20/40" as const,
        NAs: 2,
        ES: 3,
        EB: 4,
        cons: 1,
        enhanced: false,
      };

      expect(Member.serialize(raw)).toEqual(raw);
    });
  });
});
