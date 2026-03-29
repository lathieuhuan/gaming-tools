import type { TavernSelectedCharacter } from "@/components";
import type { Artifact, UpdatableKey, Weapon } from "@/models";
import type {
  ArtifactSubStat,
  ArtifactType,
  IArtifactBasic,
  ICharacterBasic,
  IWeaponBasic,
} from "@/types";
import type { UserdbState } from "@Store/userdbSlice";

import {
  createArtifact,
  createCharacterCalc,
  createWeapon,
  createWeaponBasic,
} from "@/logic/entity.logic";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { ArtifactGear, Team } from "@/models";
import IdStore from "@/utils/IdStore";
import { MemberCalc } from "../logic/MemberCalc";
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

  const weaponBasic = weaponID
    ? parseDbWeapon(weaponID, userWps, data.weaponType)
    : createWeaponBasic({ type: data.weaponType });

  // weaponBasic.ID !== weaponID => weaponBasic is new => use weaponBasic.ID as seed
  const idStore = new IdStore(weaponBasic.ID !== weaponID ? weaponBasic.ID : undefined);

  const artifacts = parseDbArtifacts(artifactIDs, userArts).map((artifactBasic) =>
    createArtifact(artifactBasic, undefined, idStore)
  );

  const weapon = createWeapon(weaponBasic);
  const atfGear = new ArtifactGear(artifacts);
  const team = new Team();

  // TODO merge characterCalc & memberCalc
  const character = createCharacterCalc(
    {
      ...userData,
      code: data.code,
      weapon,
      atfGear,
    },
    data,
    team
  );
  const member = new MemberCalc(character, data, team);

  updateActiveSimulation((simulation) => {
    if (currMemberCode) {
      delete simulation.members[currMemberCode];

      simulation.memberOrder = simulation.memberOrder.map((code) =>
        code === currMemberCode ? data.code : code
      );
    } else {
      simulation.memberOrder.push(data.code);
    }

    simulation.members[data.code] = member;
  });
}

export function removeMember(code: number) {
  updateActiveSimulation((simulation) => {
    delete simulation.members[code];

    simulation.memberOrder = simulation.memberOrder.filter((c) => c !== code);
  });
}

export function updateMember<T extends keyof ICharacterBasic>(
  code: number,
  key: T,
  value: ICharacterBasic[T]
) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      simulation.members[code] = simulation.members[code].clone().update(key, value);
    }
  });
}

// ===== WEAPON =====

export function switchWeapon(code: number, weapon: Weapon) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      simulation.members[code] = simulation.members[code].clone().equip(weapon);
    }
  });
}

export function updateWeapon(code: number, data: Partial<IWeaponBasic>) {
  updateActiveSimulation((simulation) => {
    if (code in simulation.members) {
      const member = simulation.members[code].clone();
      const weapon = member.weapon.clone().update(data);

      simulation.members[code] = member.equip(weapon);
    }
  });
}

// ===== ARTIFACT =====

export function switchArtifact(code: number, artifact: Artifact) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code].clone();
  const pieces = member.atfGear.pieces.clone().set(artifact.type, artifact);

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.equip(new ArtifactGear(pieces));
  });
}

export function updateArtifact<T extends UpdatableKey>(
  code: number,
  type: ArtifactType,
  key: T,
  value: IArtifactBasic[T]
) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code].clone();
  const pieces = member.atfGear.pieces.clone();
  const piece = pieces.get(type)?.clone().update(key, value);

  if (!piece) {
    return;
  }

  const atfGear = new ArtifactGear(pieces.set(type, piece));

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.equip(atfGear);
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

  const member = members[code].clone();
  const pieces = member.atfGear.pieces.clone();
  const piece = pieces.get(type)?.clone().updateSubStatByIndex(index, data);

  if (!piece) {
    return;
  }

  const atfGear = new ArtifactGear(pieces.set(type, piece));

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.equip(atfGear);
  });
}

export function removeArtifact(code: number, type: ArtifactType) {
  const { members } = selectSimulation(useSimulatorStore.getState());

  if (!(code in members)) {
    return;
  }

  const member = members[code].clone();
  const pieces = member.atfGear.pieces.clone();

  pieces.delete(type);

  const atfGear = new ArtifactGear(pieces);

  updateActiveSimulation((simulation) => {
    simulation.members[code] = member.equip(atfGear);
  });
}
