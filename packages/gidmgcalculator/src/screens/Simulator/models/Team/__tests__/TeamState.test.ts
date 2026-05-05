import { describe, expect, test } from "vitest";

import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { __createMember } from "../../../__tests__/utils";
import { Member } from "../../Member";
import { TeamState } from "../TeamState";

function teamMap(...members: Member[]) {
  const map = new Map<number, Member>();
  for (const m of members) {
    map.set(m.code, m);
  }
  return map;
}

describe("TeamState", () => {
  describe("constructor", () => {
    test("initializes empty element counts, and zero milestone levels for an empty team", () => {
      const state = new TeamState(new Map());

      expect([...state.elmtCount.keys]).toEqual([]);
      expect(state.moonsignLv).toBe(0);
      expect(state.witchRiteLv).toBe(0);
    });

    test("aggregates element counts from each member vision", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const state = new TeamState(teamMap(a, b));

      expect(state.elmtCount.get("pyro")).toBe(1);
      expect(state.elmtCount.get("hydro")).toBe(1);
    });

    test("counts moonsign faction members and caps at 2", () => {
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const m2 = __createMember({ characterCode: CharacterMock.DENDRO_NODKRAI });
      const m3 = __createMember({ characterCode: CharacterMock.ELECTRO_CATALYST_NODKRAI });

      expect(new TeamState(teamMap(m1)).moonsignLv).toBe(1);
      expect(new TeamState(teamMap(m1, m2)).moonsignLv).toBe(2);
      expect(new TeamState(teamMap(m1, m2, m3)).moonsignLv).toBe(2);
    });

    test("counts enhanced HEXEREI members for witch rite and caps at 2", () => {
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const m2 = __createMember({ characterCode: CharacterMock.ELECTRO_BOW_HEXEREI });
      const m3 = __createMember({ characterCode: CharacterMock.ANEMO_CLAYMORE_HEXEREI });

      m1.state.update({ enhanced: true });
      m2.state.update({ enhanced: true });
      m3.state.update({ enhanced: true });

      expect(new TeamState(teamMap(m1)).witchRiteLv).toBe(1);
      expect(new TeamState(teamMap(m1, m2)).witchRiteLv).toBe(2);
      expect(new TeamState(teamMap(m1, m2, m3)).witchRiteLv).toBe(2);
    });
  });

  describe("isTeamElmtValid", () => {
    test("returns false when the team has an element outside teamOnlyElmts", () => {
      const a = __createMember({ characterCode: CharacterMock.CRYO_POLEARM });
      const state = new TeamState(teamMap(a));

      expect(
        state.isTeamElmtValid({
          teamOnlyElmts: ["pyro", "hydro"],
        })
      ).toBe(false);
    });

    test("returns true when every team element is listed in teamOnlyElmts", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const state = new TeamState(teamMap(a, b));

      expect(
        state.isTeamElmtValid({
          teamOnlyElmts: ["pyro", "hydro"],
        })
      ).toBe(true);
    });

    test("returns false when teamEachElmtCount is not met", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const state = new TeamState(teamMap(a));

      expect(
        state.isTeamElmtValid({
          teamEachElmtCount: { pyro: 2 },
        })
      ).toBe(false);
    });

    test("returns true when teamEachElmtCount is satisfied", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const state = new TeamState(teamMap(a, b));

      expect(
        state.isTeamElmtValid({
          teamEachElmtCount: { pyro: 2 },
        })
      ).toBe(true);
    });

    test("evaluates teamElmtTotalCount against summed counts for the listed elements", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const state = new TeamState(teamMap(a, b));

      expect(
        state.isTeamElmtValid({
          teamElmtTotalCount: {
            elements: ["pyro", "hydro"],
            value: 2,
            comparison: "MIN",
          },
        })
      ).toBe(true);

      expect(
        state.isTeamElmtValid({
          teamElmtTotalCount: {
            elements: ["pyro", "hydro"],
            value: 3,
            comparison: "MIN",
          },
        })
      ).toBe(false);
    });

    test("uses distinct element key count when teamTotalElmtCount omits elements", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
      const state = new TeamState(teamMap(a, b));

      expect(
        state.isTeamElmtValid({
          teamTotalElmtCount: { value: 2, comparison: "EQUAL" },
        })
      ).toBe(true);

      expect(
        state.isTeamElmtValid({
          teamTotalElmtCount: { value: 3, comparison: "EQUAL" },
        })
      ).toBe(false);
    });

    test("uses combined counts for teamTotalElmtCount when elements are provided", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const b = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const state = new TeamState(teamMap(a, b));

      expect(
        state.isTeamElmtValid({
          teamTotalElmtCount: {
            elements: ["pyro"],
            value: 2,
            comparison: "EQUAL",
          },
        })
      ).toBe(true);
    });

    test("varkaPHEC AND requires two anemo and two of the same PHEC element", () => {
      const anemo1 = __createMember({ characterCode: CharacterMock.ANEMO_CLAYMORE_HEXEREI });
      const anemo2 = __createMember({ characterCode: CharacterMock.ANEMO_CLAYMORE_LIYUE });
      const pyro1 = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const pyro2 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const ok = new TeamState(teamMap(anemo1, anemo2, pyro1, pyro2));

      expect(ok.isTeamElmtValid({ varkaPHEC: "AND" })).toBe(true);

      const missingPhec = new TeamState(teamMap(anemo1, anemo2, pyro1));
      expect(missingPhec.isTeamElmtValid({ varkaPHEC: "AND" })).toBe(false);
    });

    test("varkaPHEC OR passes when either two anemo or two same PHEC is satisfied", () => {
      const twoPyro = teamMap(
        __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI }),
        __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI })
      );
      expect(new TeamState(twoPyro).isTeamElmtValid({ varkaPHEC: "OR" })).toBe(true);

      const oneAnemo = teamMap(
        __createMember({ characterCode: CharacterMock.ANEMO_CLAYMORE_LIYUE })
      );
      expect(new TeamState(oneAnemo).isTeamElmtValid({ varkaPHEC: "OR" })).toBe(false);
    });
  });

  describe("isTeamMilestoneValid", () => {
    test("returns true when condition is undefined", () => {
      const state = new TeamState(new Map());
      expect(state.isTeamMilestoneValid(undefined)).toBe(true);
    });

    test("accepts shorthand string milestone and defaults to value 2 EQUAL", () => {
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const m2 = __createMember({ characterCode: CharacterMock.DENDRO_NODKRAI });
      const ok = new TeamState(teamMap(m1, m2));

      expect(ok.isTeamMilestoneValid("MOONSIGN")).toBe(true);

      const one = new TeamState(teamMap(m1));
      expect(one.isTeamMilestoneValid("MOONSIGN")).toBe(false);
    });

    test("uses explicit comparison and value for milestone objects", () => {
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const state = new TeamState(teamMap(m1));

      expect(
        state.isTeamMilestoneValid({
          type: "MOONSIGN",
          value: 1,
          comparison: "MIN",
        })
      ).toBe(true);

      expect(
        state.isTeamMilestoneValid({
          type: "MOONSIGN",
          value: 2,
          comparison: "EQUAL",
        })
      ).toBe(false);
    });
  });

  describe("isAvailableEffect", () => {
    test("returns true when condition is undefined", () => {
      const state = new TeamState(new Map());
      expect(state.isAvailableEffect(undefined)).toBe(true);
    });

    test("returns false when element rules fail even if milestone passes", () => {
      const a = __createMember({ characterCode: CharacterMock.CRYO_POLEARM });
      const state = new TeamState(teamMap(a));

      expect(
        state.isAvailableEffect({
          teamOnlyElmts: ["pyro"],
          checkTeamMs: "MOONSIGN",
        })
      ).toBe(false);
    });

    test("returns false when milestone check fails", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const state = new TeamState(teamMap(a));

      expect(
        state.isAvailableEffect({
          checkTeamMs: "MOONSIGN",
        })
      ).toBe(false);
    });

    test("returns true when both element and milestone checks pass", () => {
      const m1 = __createMember({ characterCode: CharacterMock.PYRO_BOW_NODKRAI });
      const m2 = __createMember({ characterCode: CharacterMock.DENDRO_NODKRAI });
      const state = new TeamState(teamMap(m1, m2));

      expect(
        state.isAvailableEffect({
          teamOnlyElmts: ["pyro", "dendro"],
          checkTeamMs: "MOONSIGN",
        })
      ).toBe(true);
    });
  });
});
