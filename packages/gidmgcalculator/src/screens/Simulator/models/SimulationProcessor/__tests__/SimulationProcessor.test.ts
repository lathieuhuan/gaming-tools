import { describe, expect, test, vi } from "vitest";

import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  SimulationEvent,
  SwitchInEvent,
} from "@/screens/Simulator/types";

import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { createTarget } from "@/logic/entity.logic";
import { Target } from "@/models/Target";
import { TargetCalc } from "@/models/TargetCalc";
import { __createMember } from "@/screens/Simulator/__tests__/utils";
import { EHitLogType, SimulationProcessor } from "../SimulationProcessor";

function createTargetCalc() {
  return new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);
}

function createTwoMemberProcessor(onFieldCode: number) {
  const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
  const b = __createMember({ characterCode: CharacterMock.HYDRO_CATALYST });
  const members = new Map<number, typeof a>([
    [a.code, a],
    [b.code, b],
  ]);
  const target = createTargetCalc();
  return new SimulationProcessor(members, target, onFieldCode);
}

describe("SimulationProcessor", () => {
  describe("constructor", () => {
    test("wires team and target and initializes both", () => {
      const a = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const members = new Map([[a.code, a]]);
      const target = createTargetCalc();

      const processor = new SimulationProcessor(members, target, a.code);

      expect(processor.team.onFieldMember.code).toBe(a.code);
      expect(processor.target).toBe(target);
      expect(processor.hitLogs).toEqual([]);
    });
  });

  describe("runSwitchInEvent", () => {
    test("sets the on-field member to the event performer", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const bCode = CharacterMock.HYDRO_CATALYST;
      const event: SwitchInEvent = {
        id: "si-1",
        cate: "M",
        type: "SI",
        performer: bCode,
      };

      processor.runSwitchInEvent(event);

      expect(processor.team.onFieldMember.code).toBe(bCode);
    });
  });

  describe("runAbilityHitEvent", () => {
    test("returns a member hit log with performer, value, and attack element from calculation", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: AbilityHitEvent = {
        id: "ah-1",
        cate: "M",
        type: "AH",
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };

      const log = processor.runAbilityHitEvent(event);

      expect(log.type).toBe(EHitLogType.MEMBER);
      if (log.type !== EHitLogType.MEMBER) {
        throw new Error("expected member hit log");
      }
      expect(log.performer).toBe(event.performer);
      expect(typeof log.value).toBe("number");
      expect(log.value).toBeGreaterThanOrEqual(0);
      expect(log.attElmt).toBeDefined();
    });

    test("passes optional element and reaction through to the hit log", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: AbilityHitEvent = {
        id: "ah-2",
        cate: "M",
        type: "AH",
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "ES",
        index: 0,
        attElmt: "pyro",
        reaction: "melt",
      };

      const log = processor.runAbilityHitEvent(event);

      expect(log.reaction).toBe("melt");
    });
  });

  describe("runAbilityBuffEvent", () => {
    test("warns and returns when no buff matches modId", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: AbilityBuffEvent = {
        id: "ab-1",
        cate: "M",
        type: "AB",
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        modId: 9_999_999,
      };

      processor.runAbilityBuffEvent(event);

      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Buff not found"));
      warn.mockRestore();
    });

    test("warns and returns when the buff exists but inputs fail performEffect", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const member = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        dataPatch: {
          buffs: [
            {
              id: 7,
              src: "Test buff",
              description: "",
              checkInput: 1,
              effects: {
                target: { module: "ATTR", path: "em" },
                value: 10,
              },
            },
          ],
        },
      });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const event: AbilityBuffEvent = {
        id: "ab-2",
        cate: "M",
        type: "AB",
        performer: member.code,
        modId: 7,
        inputs: [],
      };

      processor.runAbilityBuffEvent(event);

      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Buff not valid"));
      warn.mockRestore();
    });

    test("logs info and returns when no effect specs remain after filtering", () => {
      const info = vi.spyOn(console, "info").mockImplementation(() => {});
      const member = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        dataPatch: {
          buffs: [
            {
              id: 8,
              src: "Filtered effects",
              description: "",
              checkInput: 1,
              effects: {
                target: { module: "ATTR", path: "em" },
                value: 10,
                checkInput: 999,
              },
            },
          ],
        },
      });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const event: AbilityBuffEvent = {
        id: "ab-3",
        cate: "M",
        type: "AB",
        performer: member.code,
        modId: 8,
        inputs: [1],
      };

      processor.runAbilityBuffEvent(event);

      expect(info).toHaveBeenCalledWith(expect.stringContaining("No available effects"));
      info.mockRestore();
    });
  });

  describe("runMemberEvent", () => {
    test("routes SI to switch-in and AH to ability hit logging", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const si: SwitchInEvent = {
        id: "m-si",
        cate: "M",
        type: "SI",
        performer: CharacterMock.HYDRO_CATALYST,
      };
      const ah: AbilityHitEvent = {
        id: "m-ah",
        cate: "M",
        type: "AH",
        performer: CharacterMock.HYDRO_CATALYST,
        talent: "NA",
        index: 0,
      };

      processor.runMemberEvent(si);
      processor.runMemberEvent(ah);

      expect(processor.team.onFieldMember.code).toBe(CharacterMock.HYDRO_CATALYST);
      expect(processor.hitLogs).toHaveLength(1);
      expect(processor.hitLogs[0].type).toBe(EHitLogType.MEMBER);
    });
  });

  describe("runTimeline", () => {
    test("clears hit logs on each run then records AH events", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const ah: AbilityHitEvent = {
        id: "tl-ah",
        cate: "M",
        type: "AH",
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };
      const timeline: SimulationEvent[] = [ah];

      processor.runTimeline(timeline);
      expect(processor.hitLogs).toHaveLength(1);

      processor.runTimeline(timeline);
      expect(processor.hitLogs).toHaveLength(1);
    });

    test("ignores environment events without throwing", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const timeline: SimulationEvent[] = [{ id: "env", cate: "E" }];

      expect(() => processor.runTimeline(timeline)).not.toThrow();
      expect(processor.hitLogs).toHaveLength(0);
    });

    test("replaces each team member with a clone after processing", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const beforeA = processor.team.getMember(CharacterMock.PYRO_SWORD_HEXEREI);
      const beforeB = processor.team.getMember(CharacterMock.HYDRO_CATALYST);

      processor.runTimeline([]);

      expect(processor.team.getMember(CharacterMock.PYRO_SWORD_HEXEREI)).not.toBe(beforeA);
      expect(processor.team.getMember(CharacterMock.HYDRO_CATALYST)).not.toBe(beforeB);
    });
  });
});
