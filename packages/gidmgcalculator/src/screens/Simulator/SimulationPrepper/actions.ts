import type { TavernSelectedCharacter } from "@/components";
import type { ICharacterBasic } from "@/types";
import type { UserdbState } from "@Store/userdbSlice";

import {
  createArtifact,
  createCharacterBasic,
  createWeapon,
  createWeaponBasic,
} from "@/logic/entity.logic";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { Artifact, ArtifactGear, CharacterCalc, Team, Weapon } from "@/models";
import IdStore from "@/utils/IdStore";
import { useSimulatorStore } from "../store";

/** Same logic as initSessionWithCharacter */
export function switchMember(
  index: number,
  tavernCharacter: TavernSelectedCharacter,
  userDb: UserdbState
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

  const member = new CharacterCalc(
    {
      ...createCharacterBasic({ ...userData, code: data.code }),
      weapon,
      atfGear,
    },
    data,
    team
  );

  useSimulatorStore.setState((state) => {
    state.members[index] = member;
    team.updateMembers(state.members);
    state.team = team;
  });
}

export function removeMember(name: string) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.filter((member) => member.data.name !== name);
  });
}

export function updateMember<T extends keyof ICharacterBasic>(
  code: number,
  key: T,
  value: ICharacterBasic[T]
) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.map((member) => {
      return member.data.code === code ? member.update(key, value).clone() : member;
    });

    if (key === "enhanced") {
      state.team = new Team(state.members);
    }
  });
}

export function switchWeapon(name: string, weapon: Weapon) {
  useSimulatorStore.setState((state) => {
    state.members = state.members.map((member) => {
      return member.data.name === name ? member.equip(weapon).clone() : member;
    });
  });
}

export function switchArtifact(name: string, artifact: Artifact) {
  const newMembers = useSimulatorStore.getState().members.map((member) => {
    if (member.data.name === name) {
      const newPieces = member.atfGear.pieces.clone().set(artifact.type, artifact);
      return member.clone().equip(new ArtifactGear(newPieces));
    }

    return member;
  });

  useSimulatorStore.setState((state) => {
    state.members = newMembers;
  });
}
