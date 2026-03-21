import { createCharacterCalc, createTarget, createWeapon } from "@/logic/entity.logic";
import { ArtifactGear, Target, Team } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import IdStore from "@/utils/IdStore";
import { SimulationProcessor } from "../logic/SimulationProcessor";
import { SimulatorState, useSimulatorStore } from "../store";

export function startDevSimulation() {
  const team = new Team();
  const idStore = new IdStore();

  const member1 = createCharacterCalc({
    code: 29,
    weapon: createWeapon(
      {
        type: "sword",
      },
      undefined,
      idStore
    ),
    atfGear: new ArtifactGear(),
  }).initCalc();

  const member2 = createCharacterCalc({
    code: 84,
    weapon: createWeapon(
      {
        type: "sword",
      },
      undefined,
      idStore
    ),
    atfGear: new ArtifactGear(),
  }).initCalc();

  const member3 = createCharacterCalc({
    code: 18,
    weapon: createWeapon(
      {
        type: "bow",
      },
      undefined,
      idStore
    ),
    atfGear: new ArtifactGear(),
  }).initCalc();

  const member4 = createCharacterCalc({
    code: 116,
    weapon: createWeapon(
      {
        type: "sword",
      },
      undefined,
      idStore
    ),
    atfGear: new ArtifactGear(),
  }).initCalc();

  team.updateMembers([member1, member2, member3, member4]);

  const members = {
    29: member1,
    84: member2,
    18: member3,
    116: member4,
  };
  const target = new TargetCalc(createTarget({ code: 0 }), Target.DEFAULT_MONSTER);

  const devInitialState: SimulatorState = {
    activeId: 1774085344498,
    managers: [
      {
        id: 1774085344498,
        name: "New Simulation",
      },
    ],
    simulationsById: {
      1774085344498: {
        id: 1774085344498,
        activeMember: 29,
        memberOrder: [29, 84, 18, 116],
        timeline: [],
        members,
        target,
        processor: new SimulationProcessor(members, target, 29),
      },
    },
    step: "BUILD",
  };

  useSimulatorStore.setState(devInitialState);
}
