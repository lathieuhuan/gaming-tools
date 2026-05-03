import { describe, expect, test, vi } from "vitest";

import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { __createMember } from "@/screens/Simulator/__tests__/utils";
import { Member } from "../../Member";
import { Team } from "../Team";

describe("Team", () => {
  describe("constructor", () => {
    test("accepts an empty team and wires TeamState to the member map", () => {
      const team = new Team([], CharacterMock.PYRO_SWORD_HEXEREI);

      expect(team.memberList).toEqual([]);
      expect(team.state.elmtCount.keys.length).toBe(0);
    });

    test("accepts a Map of members", () => {
      const a = __createMember({ characterCode: CharacterMock.CRYO_POLEARM });
      const map = new Map<number, Member>([[a.code, a]]);
      const team = new Team(map, a.code);

      expect(team.hasMember(a.code)).toBe(true);
      expect(team.state.elmtCount.get("cryo")).toBe(1);
    });
  });

  describe("FlatGetters state delegation", () => {
    test("exposes resonances, milestone levels, and element counts from state", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const team = new Team([a, b], a.code);

      expect(team.resonances).toEqual(team.state.resonances);
      expect(team.moonsignLv).toBe(team.state.moonsignLv);
      expect(team.witchRiteLv).toBe(team.state.witchRiteLv);
      expect(team.elmtCount).toBe(team.state.elmtCount);
    });
  });

  describe("onFieldMember", () => {
    test("returns the member matching onFieldMemberCode", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], b.code);

      expect(team.onFieldMember).toBe(b);
    });
  });

  describe("setOnFieldMember", () => {
    test("updates onFieldMemberCode when given a numeric code", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], a.code);

      team.setOnFieldMember(b.code);

      expect(team.onFieldMember).toBe(b);
    });

    test("updates onFieldMemberCode when given a Member instance", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], a.code);

      team.setOnFieldMember(b);

      expect(team.onFieldMember).toBe(b);
    });
  });

  describe("hasMember", () => {
    test("returns whether the team map contains the character code", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([a], a.code);

      expect(team.hasMember(a.code)).toBe(true);
      expect(team.hasMember(CharacterMock.HYDRO_CATALYST)).toBe(false);
    });
  });

  describe("getMember", () => {
    test("returns the existing member instance for a known code", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([a], a.code);

      expect(team.getMember(a.code)).toBe(a);
    });

    test("logs an error and synthesizes a member when the code is not on the team", () => {
      const err = vi.spyOn(console, "error").mockImplementation(() => {});
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([a], a.code);

      const fallback = team.getMember(CharacterMock.HYDRO_CATALYST);

      expect(err).toHaveBeenCalled();
      expect(fallback).toBeInstanceOf(Member);
      expect(fallback.code).toBe(CharacterMock.HYDRO_CATALYST);
      err.mockRestore();
    });
  });

  describe("setMember", () => {
    test("adds a member, rebuilds TeamState, and returns true", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a], a.code);
      const prevState = team.state;

      const ok = team.setMember(b);

      expect(ok).toBe(true);
      expect(team.hasMember(b.code)).toBe(true);
      expect(team.state).not.toBe(prevState);
      expect(team.state.elmtCount.get("hydro")).toBe(1);
    });

    test("returns false and logs when the team already has four distinct members", () => {
      const err = vi.spyOn(console, "error").mockImplementation(() => {});
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const m2 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const m3 = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const m4 = __createMember({ characterCode: CharacterMock.CRYO_POLEARM });
      const m5 = __createMember({ characterCode: CharacterMock.GEO_POLEARM });
      const team = new Team([m1, m2, m3, m4], m1.code);

      expect(team.setMember(m5)).toBe(false);
      expect(team.hasMember(m5.code)).toBe(false);
      expect(err).toHaveBeenCalled();
      err.mockRestore();
    });

    test("still replaces a member when at capacity if the code already exists", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const c = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const d = __createMember({ characterCode: CharacterMock.CRYO_POLEARM });
      const team = new Team([a, b, c, d], a.code);
      const replacement = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        level: "90/90",
      });

      expect(team.setMember(replacement)).toBe(true);
      expect(team.getMember(a.code)).toBe(replacement);
    });
  });

  describe("removeMember", () => {
    test("removes a member, rebuilds state, and returns true", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], a.code);
      const prevState = team.state;

      expect(team.removeMember(b.code)).toBe(true);
      expect(team.hasMember(b.code)).toBe(false);
      expect(team.state).not.toBe(prevState);
    });

    test("returns false when the code was not present", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([a], a.code);

      expect(team.removeMember(CharacterMock.HYDRO_CATALYST)).toBe(false);
    });
  });

  describe("init", () => {
    test("calls initCalculation on every member", () => {
      const tartaglia = __createMember({ characterCode: CharacterMock.TARTAGLIA });
      const other = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([tartaglia, other], tartaglia.code);
      const spyT = vi.spyOn(tartaglia, "initCalculation");
      const spyO = vi.spyOn(other, "initCalculation");

      team.init();

      expect(spyT).toHaveBeenCalledWith();
      expect(spyO).toHaveBeenCalledWith();
    });

    test("calls finalizeAttrs on every member after applying innate bonuses", () => {
      const tartaglia = __createMember({ characterCode: CharacterMock.TARTAGLIA });
      const other = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([tartaglia, other], tartaglia.code);
      const spyT = vi.spyOn(tartaglia, "finalizeAttrs");
      const spyO = vi.spyOn(other, "finalizeAttrs");

      team.init();

      expect(spyT).toHaveBeenCalled();
      expect(spyO).toHaveBeenCalled();
    });
  });

  describe("createMember", () => {
    test("builds a Member from app character data and a default weapon for that type", () => {
      const member = Team.createMember(CharacterMock.HYDRO_CATALYST);

      expect(member.code).toBe(CharacterMock.HYDRO_CATALYST);
      expect(member.data.weaponType).toBe(member.weapon.data.type);
    });
  });

  describe("getMemberOps", () => {
    test("returns act, can, and show bundles for the given member", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const team = new Team([a], a.code);
      const ops = team.getMemberOps(a);

      expect(typeof ops.act).toBe("object");
      expect(typeof ops.can).toBe("object");
      expect(typeof ops.show).toBe("object");
    });
  });

  describe("finalizeMembers", () => {
    test("calls finalizeAttrs on every member", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], a.code);
      const spyA = vi.spyOn(a, "finalizeAttrs");
      const spyB = vi.spyOn(b, "finalizeAttrs");

      team.finalizeMembers();

      expect(spyA).toHaveBeenCalled();
      expect(spyB).toHaveBeenCalled();
    });
  });

  describe("clone", () => {
    test("copies member roster and on-field code using cloned Member instances", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([a, b], b.code);

      const copy = team.clone();

      expect(copy).not.toBe(team);
      expect(copy.onFieldMember.code).toBe(b.code);

      for (const clone of copy.memberList) {
        const og = team.getMember(clone.code);

        expect(og).not.toBeUndefined();
        expect(clone).not.toBe(og);
        expect(clone.code).toBe(og.code);
      }
    });
  });

  describe("getMixedCount", () => {
    test("counts members whose vision differs from the performer element", () => {
      const pyro = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const hydro = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const team = new Team([pyro, hydro], pyro.code);

      expect(team.getMixedCount("pyro")).toBe(1);
      expect(team.getMixedCount("hydro")).toBe(1);
    });

    test("counts Natlan members even when their vision matches the performer element", () => {
      const mondstadtPyro = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const natlanPyro = __createMember({
        characterCode: CharacterMock.PYRO_BOW_NODKRAI,
        dataPatch: { nation: "natlan" },
      });
      const team = new Team([mondstadtPyro, natlanPyro], mondstadtPyro.code);

      expect(team.getMixedCount("pyro")).toBe(1);
    });

    test("returns zero when every member matches the performer and none are Natlan", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const team = new Team([a, b], a.code);

      expect(team.getMixedCount("pyro")).toBe(0);
    });
  });
});
