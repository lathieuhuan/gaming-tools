import { PartiallyRequiredOnly } from "rond";

import {
  createCharacterCalc,
  createTarget,
  createWeapon,
  CreateWeaponParams,
} from "@/logic/entity.logic";
import { ArtifactGear, CharacterCalc, Target, Team } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import { $AppCharacter } from "@/services";
import { ICharacterBasic } from "@/types";
import IdStore from "@/utils/IdStore";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { Simulation } from "../types";

export type MemberConfig = PartiallyRequiredOnly<ICharacterBasic, "code"> & {
  weapon?: CreateWeaponParams;
};

const idStore = new IdStore();

export function createSimulation1(memberConfigs: MemberConfig[]): Simulation {
  const team = new Team();
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const memberOrder: number[] = [];
  const members: Record<number, CharacterCalc> = {};
  const memberList: CharacterCalc[] = [];

  for (const config of memberConfigs) {
    const data = $AppCharacter.get(config.code);
    const weapon = createWeapon(config.weapon || { type: data.weaponType }, undefined, idStore);

    const member = createCharacterCalc(
      {
        ...config,
        weapon,
        atfGear: new ArtifactGear(),
      },
      data,
      team
    );

    memberOrder.push(config.code);
    memberList.push(member);
    members[config.code] = member;
  }

  team.updateMembers(memberList);

  const simulation: Simulation = {
    id: idStore.gen(),
    activeMember: memberOrder[0],
    memberOrder,
    timeline: [],
    members,
    target,
    processor: new SimulationProcessor(members, target, memberOrder[0]),
  };

  return simulation;
}
