import { useMemo, useState } from "react";
import { ConfirmModal } from "rond";

import type { IArtifactGearSlot } from "@/types";
import type { Artifact, CalcCharacter } from "@/models/base";

import { useDispatch } from "@Store/hooks";
import { ActiveCharAction, ActiveCharActionContext } from "./_context";
import {
  removeUserCharacter,
  switchArtifact,
  switchWeapon,
  viewCharacter,
} from "@Store/userdb-slice";
import { ArtifactInventory, Tavern, WeaponInventory } from "@/components";

type ModalType = "SWITCH_CHARACTER" | "SWITCH_WEAPON" | "SWITCH_ARTIFACT" | "REMOVE_CHARACTER" | "";

type ActionProviderProps = {
  character: CalcCharacter;
  children: React.ReactNode;
};

export function ActionProvider({ character, children }: ActionProviderProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const [switchedSlot, setSwitchedSlot] = useState<IArtifactGearSlot<Artifact> | null>(null);

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
            Remove <b>{character.name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeUserCharacter(character.name))}
        onClose={closeModal}
      />

      <Tavern
        active={modalType === "SWITCH_CHARACTER"}
        sourceType="user"
        onSelectCharacter={(character) => {
          dispatch(viewCharacter(character.data.name));
        }}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "SWITCH_WEAPON"}
        owner={character.name}
        weaponType={weapon.type}
        buttonText="Switch"
        onClickButton={(selectedWeapon) => {
          dispatch(
            switchWeapon({
              newOwner: selectedWeapon.owner,
              newID: selectedWeapon.ID,
              oldOwner: character.name,
              oldID: weapon.ID,
            })
          );
        }}
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modalType === "SWITCH_ARTIFACT"}
        currentArtifact={atfGear}
        forcedType={switchedSlot?.type}
        owner={character.name}
        buttonText="Switch"
        onClickButton={(selectedArtifact) => {
          if (!switchedSlot) {
            return;
          }

          // TODO
          // dispatch(
          //   switchArtifact({
          //     newOwner: selectedArtifact.owner,
          //     newID: selectedArtifact.ID,
          //     oldOwner: character.name,
          //     oldID: currentPiece?.ID || 0,
          //     artifactIndex: switchedArtifactI,
          //   })
          // );
        }}
        onClose={closeModal}
      />
    </ActiveCharActionContext.Provider>
  );
}
