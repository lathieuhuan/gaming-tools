import { useMemo, useState } from "react";
import { ConfirmModal } from "rond";

import type { ArtifactGearSlot, Character } from "@/models";

import { useDispatch } from "@Store/hooks";
import {
  removeDbCharacter,
  switchArtifact,
  switchWeapon,
  viewDbCharacter,
} from "@Store/userdbSlice";
import { ActiveCharAction, ActiveCharActionContext } from "./context";

// Component
import { ArtifactInventory } from "@/components/ArtifactInventory";
import { Tavern } from "@/components/Tavern";
import { WeaponInventory } from "@/components/WeaponInventory";

type ModalType = "SWITCH_CHARACTER" | "SWITCH_WEAPON" | "SWITCH_ARTIFACT" | "REMOVE_CHARACTER" | "";

type ActionProviderProps = {
  character: Character;
  children: React.ReactNode;
};

export function ActionProvider({ character, children }: ActionProviderProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const [switchedSlot, setSwitchedSlot] = useState<ArtifactGearSlot | null>(null);

  const { weapon, atfGear } = character;

  const closeModal = () => setModalType("");

  const actions: ActiveCharAction = useMemo(() => {
    return {
      requestSwitchCharacter: () => {
        setModalType("SWITCH_CHARACTER");
      },
      requestSwitchWeapon: () => {
        setModalType("SWITCH_WEAPON");
      },
      requestSwitchArtifact: (slot) => {
        setModalType("SWITCH_ARTIFACT");
        setSwitchedSlot(slot);
      },
      requestRemoveCharacter: () => {
        setModalType("REMOVE_CHARACTER");
      },
    };
  }, []);

  return (
    <ActiveCharActionContext.Provider value={actions}>
      {children}

      <ConfirmModal
        active={modalType === "REMOVE_CHARACTER"}
        danger
        message={
          <>
            Remove <b>{character.data.name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeDbCharacter(character.code))}
        onClose={closeModal}
      />

      <Tavern
        active={modalType === "SWITCH_CHARACTER"}
        sourceType="user"
        onSelectCharacter={(character) => {
          dispatch(viewDbCharacter(character.data.code));
        }}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "SWITCH_WEAPON"}
        owner={character.code}
        weaponType={weapon.type}
        buttonText="Switch"
        onClickButton={(selectedWeapon) => {
          dispatch(
            switchWeapon({
              targetId: selectedWeapon.ID,
              targetOwner: selectedWeapon.owner,
              currentId: weapon.ID,
              currentOwner: character.code,
            })
          );
        }}
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modalType === "SWITCH_ARTIFACT"}
        currentAtfGear={atfGear}
        forcedType={switchedSlot?.type}
        owner={character.code}
        buttonText="Switch"
        onClickButton={(selectedArtifact) => {
          if (!switchedSlot) {
            return;
          }

          const currentPiece = atfGear?.pieces.get(switchedSlot.type);

          dispatch(
            switchArtifact({
              targetId: selectedArtifact.ID,
              targetOwner: selectedArtifact.owner,
              currentId: currentPiece?.ID,
              currentOwner: character.code,
            })
          );
        }}
        onClose={closeModal}
      />
    </ActiveCharActionContext.Provider>
  );
}
