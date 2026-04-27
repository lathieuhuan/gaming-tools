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

import { createWeapon } from "@/logic/entity.logic";
import { parseDbArtifacts } from "@/logic/userdb.logic";
import { ArtifactGear } from "@/models";
import { Member } from "@/screens/Simulator/models/Member";
import IdStore from "@/utils/IdStore";
import { AssemblingModalState, useSimulatorStore } from "../store";
import { createSimulation, updateActiveSimulation, updateMember } from "./utils";

// SIMULATOR

export function updateAssemblingModal(state: AssemblingModalState | null) {
  useSimulatorStore.setState((store) => {
    store.assemblingModal = state ?? { type: "", slot: -1 };
  });
}

// SIMULATION

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

// SIMULATION ASSEMBLING

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

  const member = new Member(data.code, data, weapon, {
    state: userData,
    atfGear,
  });

  updateActiveSimulation((simulation) => {
    if (currMemberCode) {
      simulation.members.delete(currMemberCode);

      simulation.memberOrder = simulation.memberOrder.map((code) =>
        code === currMemberCode ? data.code : code
      );
    } else {
      simulation.memberOrder.push(data.code);
    }

    simulation.members.set(data.code, member);
  });
}

export function removeMember(code: number) {
  updateActiveSimulation((simulation) => {
    simulation.members.delete(code);
    simulation.memberOrder = simulation.memberOrder.filter((c) => c !== code);
  });
}

export function updateMemberState(code: number, data: Partial<CharacterStateData>) {
  updateMember(code, (member) =>
    member.clone({
      state: member.state.update(data),
    })
  );
}

// ===== WEAPON =====

export function switchWeapon(code: number, weapon: Weapon) {
  updateMember(code, (member) => member.clone({ weapon }));
}

export function updateWeapon(code: number, data: Partial<WeaponStateData>) {
  updateMember(code, (member) => {
    const weapon = member.weapon.clone({ state: data });

    return member.clone({ weapon });
  });
}

// ===== ARTIFACT =====

export function switchArtifact(code: number, artifact: Artifact) {
  updateMember(code, (member) => {
    const pieces = member.atfGear.pieces.clone().set(artifact.type, artifact);
    const newMember = member.clone({ atfGear: new ArtifactGear(pieces) });

    return newMember;
  });
}

export function updateArtifact(code: number, type: ArtifactType, data: Partial<ArtifactStateData>) {
  updateMember(code, (member) => {
    const pieces = member.atfGear.pieces.clone();
    const piece = pieces.get(type)?.clone({ state: data });

    if (!piece) {
      return member;
    }

    const atfGear = new ArtifactGear(pieces.set(type, piece));

    return member.clone({ atfGear });
  });
}

export function updateArtifactSubStat(
  code: number,
  type: ArtifactType,
  index: number,
  data: Partial<ArtifactSubStat>
) {
  updateMember(code, (member) => {
    const pieces = member.atfGear.pieces.clone();
    const piece = pieces.get(type)?.clone();

    piece?.state.updateSubStatByIndex(index, data);

    if (!piece) {
      return member;
    }

    const atfGear = new ArtifactGear(pieces.set(type, piece));

    return member.clone({ atfGear });
  });
}

export function removeArtifact(code: number, type: ArtifactType) {
  updateMember(code, (member) => {
    const pieces = member.atfGear.pieces.clone();

    pieces.delete(type);

    return member.clone({ atfGear: new ArtifactGear(pieces) });
  });
}
