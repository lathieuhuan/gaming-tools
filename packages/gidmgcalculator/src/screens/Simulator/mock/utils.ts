import {
  createCharacter,
  createTarget,
  createWeapon,
  CreateWeaponRawData,
} from "@/logic/entity.logic";
import { Character, Target, TargetCalc, Team } from "@/models";
import { $AppCharacter } from "@/services";
import { CharacterStateData } from "@/types";
import IdStore from "@/utils/IdStore";
import { createMemberInputs } from "../actions/utils";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { Simulation, SimulationInputs } from "../types";

export type MemberConfig = Partial<CharacterStateData> & {
  code: number;
  weapon?: CreateWeaponRawData;
};

const idStore = new IdStore();

export function createSimulation1(memberConfigs: MemberConfig[]): Simulation {
  const team = new Team();
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const memberOrder: number[] = [];
  const members: Record<number, Character> = {};
  const memberList: Character[] = [];
  const inputs: SimulationInputs = {};

  for (const config of memberConfigs) {
    const data = $AppCharacter.get(config.code);

    const weaponRaw = config.weapon || { type: data.weaponType };
    const weapon = createWeapon({ ...weaponRaw, ID: idStore.gen() });

    const character = createCharacter(config, null, { weapon, team });

    memberOrder.push(config.code);
    memberList.push(character);
    members[config.code] = character;

    inputs[config.code] = createMemberInputs(character);
  }

  team.updateMembers(memberList);

  const simulation: Simulation = {
    id: idStore.gen(),
    activeMember: memberOrder[0],
    memberOrder,
    timeline: [],
    members,
    inputs,
    target,
    processor: new SimulationProcessor(members, target, memberOrder[0]),
  };

  return simulation;
}
