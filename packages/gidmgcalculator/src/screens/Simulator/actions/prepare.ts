import { Array_ } from "ron-utils";

import type { TavernSelectedCharacter } from "@/components";
import type { Artifact, Weapon } from "@/models";
import type {
  ArtifactStateData,
  ArtifactSubStat,
  ArtifactType,
  CharacterStateData,
  WeaponStateData,
} from "@/types";
import type { UserdbState } from "@Store/userdbSlice";

import { createCharacter, createWeapon } from "@/logic/entity.logic";
import { parseDbArtifacts } from "@/logic/userdb.logic";
import { ArtifactGear } from "@/models";
import IdStore from "@/utils/IdStore";
import { selectSimulation, useSimulatorStore } from "../store";
import { createSimulation, updateActiveSimulation } from "./utils";

export function startNewSimulation() {
  useSimulatorStore.setState((state) => {
    const id = Date.now();

    state.activeId = id;
    state.managers.push({ id, name: "New Simulation" });
    state.simulationsById[id] = createSimulation(id);
    state.phase = "PREP";
  });
}

export function deleteSimulation(id?: number) {
  useSimulatorStore.setState((state) => {
    const deletedId = id ?? state.activeId;

    if (state.activeId === deletedId && state.phase === "BUILD") {
      state.phase = "PREP";
      state.activeId = 0;
    }

    state.managers = state.managers.filter((manager) => manager.id !== deletedId);
    delete state.simulationsById[deletedId];
  });
}

/** Same logic as initSessionWithCharacter */
export function switchMember(
  tavernCharacter: TavernSelectedCharacter,
  userDb: UserdbState,
  currMemberCode?: number
) {
  const { userData, data } = tavernCharacter;
  const { weaponID, artifactIDs } = userData ?? {};
  const { userWps, userArts } = userDb;

  const idStore = new IdStore();

  const dbWeapon = weaponID ? Array_.findById(userWps, weaponID) : undefined;
  const weapon = dbWeapon
    ? createWeapon(dbWeapon)
    : createWeapon({ ID: idStore.gen(), type: data.weaponType });

  const atfGear = parseDbArtifacts(artifactIDs, userArts);

  const character = createCharacter({ code: data.code }, data, {
    state: userData,
    weapon,
    atfGear,
  });

  updateActiveSimulation((simulation) => {
    if (currMemberCode) {
      delete simulation.members[currMemberCode];

      simulation.memberOrder = simulation.memberOrder.map((code) =>
        code === currMemberCode ? data.code : code
      );
    } else {
      simulation.memberOrder.push(data.code);
    }

    simulation.members[data.code] = character;
  });
}

export function removeMember(code: number) {
  updateActiveSimulation((simulation) => {
    delete simulation.members[code];

    simulation.memberOrder = simulation.memberOrder.filter((c) => c !== code);
  });
}

export function updateMember(code: number, data: Partial<CharacterStateData>) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      simulation.members[code] = simulation.members[code].clone({ state: data });
    }
  });
}

// ===== WEAPON =====

export function switchWeapon(code: number, weapon: Weapon) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      simulation.members[code] = simulation.members[code].clone({ weapon });
    }
  });
}

export function updateWeapon(code: number, data: Partial<WeaponStateData>) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      const member = simulation.members[code];
      const weapon = member.weapon.clone({ state: data });

      simulation.members[code] = member.clone({ weapon });
    }
  });
}

// ===== ARTIFACT =====

export function switchArtifact(code: number, artifact: Artifact) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code];
  const pieces = member.atfGear.pieces.clone().set(artifact.type, artifact);

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.clone({ atfGear: new ArtifactGear(pieces) });
  });
}

export function updateArtifact(code: number, type: ArtifactType, data: Partial<ArtifactStateData>) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code];
  const pieces = member.atfGear.pieces.clone();
  const piece = pieces.get(type)?.clone({ state: data });

  if (!piece) {
    return;
  }

  const atfGear = new ArtifactGear(pieces.set(type, piece));

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.clone({ atfGear });
  });
}

export function updateArtifactSubStat(
  code: number,
  type: ArtifactType,
  index: number,
  data: Partial<ArtifactSubStat>
) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code];
  const pieces = member.atfGear.pieces.clone();
  const piece = pieces.get(type)?.clone();

  piece?.state.updateSubStatByIndex(index, data);

  if (!piece) {
    return;
  }

  const atfGear = new ArtifactGear(pieces.set(type, piece));

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.clone({ atfGear });
  });
}

export function removeArtifact(code: number, type: ArtifactType) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code];
  const pieces = member.atfGear.pieces.clone();

  pieces.delete(type);

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.clone({ atfGear: new ArtifactGear(pieces) });
  });
}
