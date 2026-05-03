import { describe, expect, test, vi } from "vitest";

import type {
  DbAbilityHitEvent,
  DbArtifactBuffEvent,
  DbModifyEvent,
  DbSimulationEvent,
  DbSwitchInEvent,
} from "@/screens/Simulator/types";

import { ArtifactMock } from "@/__tests__/mocks/artifacts.mock";
import { CharacterMock } from "@/__tests__/mocks/characters.mock";
import { WeaponMock } from "@/__tests__/mocks/weapons.mock";
import { __customWeaponMock } from "@/__tests__/utils/customWeaponMock";
import { createArtifact, createTarget } from "@/logic/entity.logic";
import { ArtifactGear } from "@/models/ArtifactGear";
import { Target } from "@/models/Target";
import { TargetCalc } from "@/models/TargetCalc";
import { __createMember } from "@/screens/Simulator/__tests__/utils";
import { EEventCategory, EHitEventType, EModifyEventType } from "@/screens/Simulator/configs";
import { Member } from "@/screens/Simulator/models/Member";
import { $AppCharacter } from "@/services";
import { EHitLogType, SimulationProcessor } from "../SimulationProcessor";

function createTargetCalc() {
  return new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);
}

function atfGearWithTwoPieceSet(code: number) {
  const flower = createArtifact({
    ID: 1,
    code: code,
    type: "flower",
  });
  const plume = createArtifact({
    ID: 2,
    code: code,
    type: "plume",
  });

  return new ArtifactGear([flower, plume]);
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
      const event: DbSwitchInEvent = {
        id: "si-1",
        cate: EEventCategory.MEMBER,
        type: "SI",
        performer: bCode,
      };

      processor.runSwitchInEvent(event);

      expect(processor.team.onFieldMember.code).toBe(bCode);
    });
  });

  describe("runAbilityHitEvent", () => {
    test("records a member hit log with performer, value, and attack element from calculation", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: DbAbilityHitEvent = {
        id: "ah-1",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };

      processor.runAbilityHitEvent(event);
      expect(processor.hitLogs).toHaveLength(1);
      const log = processor.hitLogs[0];

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
      const event: DbAbilityHitEvent = {
        id: "ah-2",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "ES",
        index: 0,
        attElmt: "pyro",
        reaction: "melt",
      };

      processor.runAbilityHitEvent(event);
      expect(processor.hitLogs).toHaveLength(1);
      const log = processor.hitLogs[0];

      expect(log.reaction).toBe("melt");
    });
  });

  describe("runAbilityBuffEvent", () => {
    test("records an error timeline entry when no buff matches modId", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: DbModifyEvent = {
        id: "ab-1",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ABILITY_BUFF,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        modId: 9_999_999,
      };

      processor.runAbilityBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        cate: EEventCategory.ERROR,
        message: expect.stringContaining("Buff not found"),
      });
    });

    test("records an error timeline entry when the buff exists but inputs fail performEffect", () => {
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
      const event: DbModifyEvent = {
        id: "ab-2",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ABILITY_BUFF,
        performer: member.code,
        modId: 7,
        inputs: [],
      };

      processor.runAbilityBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        cate: EEventCategory.ERROR,
        message: expect.stringContaining("Buff not valid"),
      });
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
      const event: DbModifyEvent = {
        id: "ab-3",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ABILITY_BUFF,
        performer: member.code,
        modId: 8,
        inputs: [1],
      };

      processor.runAbilityBuffEvent(event);

      expect(info).toHaveBeenCalledWith(expect.stringContaining("No available effects"));
      info.mockRestore();
    });
  });

  describe("runWeaponBuffEvent", () => {
    test("records an error timeline entry when no weapon buff matches modId", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const event: DbModifyEvent = {
        id: "wb-1",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.WEAPON_BUFF,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        modId: 9_999_999,
      };

      processor.runWeaponBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        cate: EEventCategory.ERROR,
        message: expect.stringContaining("Buff not found"),
      });
    });

    test("pushes a weapon buff timeline entry with performer, item, and buff when modId matches", () => {
      const character = $AppCharacter.get(CharacterMock.PYRO_SWORD_HEXEREI);
      const weapon = __customWeaponMock(WeaponMock.SWORD, {
        buffs: [
          {
            id: 701,
            description: 0,
            effects: {
              target: { module: "ATTR", path: "atk" },
              value: 12,
            },
          },
        ],
      });

      const member = new Member(character.code, character, weapon);
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);

      const event: DbModifyEvent = {
        id: "wb-2",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.WEAPON_BUFF,
        performer: member.code,
        modId: 701,
      };

      processor.runWeaponBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        type: EModifyEventType.WEAPON_BUFF,
        performer: member.data,
        item: weapon.data,
        buff: weapon.data.buffs![0],
      });
    });

    test("calls finalizeMembers when weapon buff effects apply", () => {
      const character = $AppCharacter.get(CharacterMock.PYRO_SWORD_HEXEREI);
      const weapon = __customWeaponMock(WeaponMock.SWORD, {
        buffs: [
          {
            id: 702,
            description: 0,
            effects: {
              target: { module: "ATTR", path: "atk" },
              value: 15,
            },
          },
        ],
      });

      const member = new Member(character.code, character, weapon);
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const finalize = vi.spyOn(processor.team, "finalizeMembers");

      processor.runWeaponBuffEvent({
        id: "wb-3",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.WEAPON_BUFF,
        performer: member.code,
        modId: 702,
      });

      expect(finalize).toHaveBeenCalled();
    });
  });

  describe("runArtifactSetBuffEvent", () => {
    test("records an error when no equipped set matches itemId", () => {
      const member = __createMember({ characterCode: CharacterMock.PYRO_SWORD_HEXEREI });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const event: DbArtifactBuffEvent = {
        id: "asb-1",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ARTIFACT_SET_BUFF,
        performer: member.code,
        itemId: ArtifactMock.SETBONUS_OF_2,
        modId: 1,
      };

      processor.runArtifactSetBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        cate: EEventCategory.ERROR,
        message: expect.stringContaining("Buff not found"),
      });
    });

    test("records an error when the set is equipped but modId does not match any buff", () => {
      const atfGear = atfGearWithTwoPieceSet(ArtifactMock.BUFFS_LV_1);
      const member = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        atfGear,
      });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const event: DbArtifactBuffEvent = {
        id: "asb-2",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ARTIFACT_SET_BUFF,
        performer: member.code,
        itemId: ArtifactMock.BUFFS_LV_1,
        modId: 9_999,
      };

      processor.runArtifactSetBuffEvent(event);

      expect(processor.timeline[0]).toMatchObject({
        cate: EEventCategory.ERROR,
        message: expect.stringContaining("Buff not found"),
      });
    });

    test("pushes an artifact set buff timeline entry with performer, item, and buff when ids match", () => {
      const buffId = 1;
      const atfGear = atfGearWithTwoPieceSet(ArtifactMock.BUFFS_LV_1);
      const data = atfGear.sets[0].data;

      const member = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        atfGear,
      });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);

      const event: DbArtifactBuffEvent = {
        id: "asb-3",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ARTIFACT_SET_BUFF,
        performer: member.code,
        itemId: ArtifactMock.BUFFS_LV_1,
        modId: buffId,
      };

      processor.runArtifactSetBuffEvent(event);

      expect(processor.timeline).toHaveLength(1);
      expect(processor.timeline[0]).toMatchObject({
        type: EModifyEventType.ARTIFACT_SET_BUFF,
        performer: member.data,
        item: data,
        buff: expect.objectContaining({ id: buffId }),
      });
    });

    test("calls finalizeMembers when artifact set buff effects apply", () => {
      const buffId = 2;
      const atfGear = atfGearWithTwoPieceSet(ArtifactMock.BUFFS_LV_1);
      const member = __createMember({
        characterCode: CharacterMock.PYRO_SWORD_HEXEREI,
        atfGear,
      });
      const members = new Map([[member.code, member]]);
      const processor = new SimulationProcessor(members, createTargetCalc(), member.code);
      const finalize = vi.spyOn(processor.team, "finalizeMembers");

      processor.runArtifactSetBuffEvent({
        id: "asb-4",
        cate: EEventCategory.MEMBER,
        type: EModifyEventType.ARTIFACT_SET_BUFF,
        performer: member.code,
        itemId: ArtifactMock.BUFFS_LV_1,
        modId: buffId,
      });

      expect(finalize).toHaveBeenCalled();
    });
  });

  describe("runMemberEvent", () => {
    test("routes SI to switch-in and AH to ability hit logging", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const si: DbSwitchInEvent = {
        id: "m-si",
        cate: EEventCategory.MEMBER,
        type: "SI",
        performer: CharacterMock.HYDRO_CATALYST,
      };
      const ah: DbAbilityHitEvent = {
        id: "m-ah",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
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
    test("replays only new trailing events when incoming ids extend the existing prefix", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const first: DbAbilityHitEvent = {
        id: "tl-ah-1",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };
      const second: DbAbilityHitEvent = {
        id: "tl-ah-2",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };

      processor.runTimeline([first]);
      expect(processor.hitLogs).toHaveLength(1);

      processor.runTimeline([first, second]);
      expect(processor.hitLogs).toHaveLength(2);
    });

    test("does not duplicate hits when the same timeline is run again", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const ah: DbAbilityHitEvent = {
        id: "tl-ah",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };
      const timeline: DbSimulationEvent[] = [ah];

      processor.runTimeline(timeline);
      expect(processor.hitLogs).toHaveLength(1);

      processor.runTimeline(timeline);
      expect(processor.hitLogs).toHaveLength(1);
    });

    test("resets and replays from scratch when a prefix id no longer matches", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const initial: DbAbilityHitEvent = {
        id: "tl-ah-a",
        cate: EEventCategory.MEMBER,
        type: EHitEventType.ABILITY_HIT,
        performer: CharacterMock.PYRO_SWORD_HEXEREI,
        talent: "NA",
        index: 0,
      };
      const replaced: DbAbilityHitEvent = {
        ...initial,
        id: "tl-ah-b",
      };

      processor.runTimeline([initial]);
      expect(processor.hitLogs).toHaveLength(1);
      const firstValue = processor.hitLogs[0].value;

      processor.runTimeline([replaced]);
      expect(processor.hitLogs).toHaveLength(1);
      expect(processor.hitLogs[0].value).toBe(firstValue);
      expect(processor.timeline[0]).toMatchObject({ id: "tl-ah-b" });
    });

    test("ignores environment events without throwing", () => {
      const processor = createTwoMemberProcessor(CharacterMock.PYRO_SWORD_HEXEREI);
      const timeline: DbSimulationEvent[] = [
        {
          id: "env",
          cate: EEventCategory.ENVIRONMENT,
        },
      ];

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
