import { ConfirmModal } from "rond";
import { selectSimulation, useSimulatorStore } from "../store";

import { useStore } from "@/lib/dynamic-store";
import {
  removeMember,
  switchArtifact,
  switchMember,
  switchWeapon,
  updateAssemblingModal,
} from "../actions/prepare";

import { ArtifactForge } from "@/components/ArtifactForge";
import { ArtifactInventory } from "@/components/ArtifactInventory";
import { Tavern, TavernSelectedCharacter } from "@/components/Tavern";
import { WeaponForge } from "@/components/WeaponForge";
import { WeaponInventory } from "@/components/WeaponInventory";

export function AssemblingModals() {
  const store = useStore();
  const modal = useSimulatorStore((state) => state.assemblingModal);
  const { memberOrder, members } = useSimulatorStore(selectSimulation);

  const memberCode = memberOrder[modal.slot];
  const member = memberCode ? members.get(memberCode) : undefined;
  const { data, atfGear } = member || {};

  const closeModal = () => {
    updateAssemblingModal(null);
  };

  const actionToMember = (action: (code: number) => void) => {
    if (memberCode) {
      action(memberCode);
    }
  };

  const handleSwitchMember = (character: TavernSelectedCharacter) => {
    switchMember(
      character,
      store.select((state) => state.userdb),
      memberCode
    );
  };

  return (
    <>
      <Tavern
        active={modal.type === "TAVERN"}
        sourceType="mixed"
        filter={(character) => {
          const characterCode = character.data.code;
          return characterCode === memberCode || !memberOrder.includes(characterCode);
        }}
        onSelectCharacter={handleSwitchMember}
        onClose={closeModal}
      />

      <ConfirmModal
        active={modal.type === "REMOVE_MEMBER"}
        danger
        focusConfirm
        message={`Remove ${data?.name}?`}
        onConfirm={() => actionToMember(removeMember)}
        onClose={closeModal}
      />

      <WeaponForge
        active={modal.type === "WEAPON_FORGE"}
        forcedType={data?.weaponType}
        onForgeWeapon={(weapon) => actionToMember((code) => switchWeapon(code, weapon))}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modal.type === "WEAPON_INVENTORY"}
        weaponType={data?.weaponType}
        buttonText="Select"
        onClickButton={(weapon) => actionToMember((code) => switchWeapon(code, weapon))}
        onClose={closeModal}
      />

      <ArtifactForge
        active={modal.type === "ARTIFACT_FORGE"}
        forcedType={modal.artifactType}
        onForgeArtifact={(artifact) => actionToMember((code) => switchArtifact(code, artifact))}
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modal.type === "ARTIFACT_INVENTORY"}
        buttonText="Select"
        currentAtfGear={atfGear}
        onClickButton={(artifact) => actionToMember((code) => switchArtifact(code, artifact))}
        onClose={closeModal}
      />
    </>
  );
}
