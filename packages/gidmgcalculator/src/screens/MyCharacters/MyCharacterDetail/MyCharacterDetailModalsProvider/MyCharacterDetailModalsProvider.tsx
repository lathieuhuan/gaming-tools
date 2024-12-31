import { useMemo, useState } from "react";
import { ConfirmModal } from "rond";
import { ARTIFACT_TYPES } from "@Backend";

import { useDispatch } from "@Store/hooks";
import { viewCharacter, removeUserCharacter, switchArtifact, switchWeapon } from "@Store/userdb-slice";

// Component
import { ArtifactInventory, Tavern, WeaponInventory } from "@Src/components";
import { useMyCharacterDetailInfo } from "../MyCharacterDetailInfoProvider";
import {
  MyCharacterDetailModalsContext,
  type MyCharacterDetailModalsControl,
} from "./my-character-detail-modals-context";

type ModalType = "SWITCH_CHARACTER" | "SWITCH_WEAPON" | "SWITCH_ARTIFACT" | "REMOVE_CHARACTER" | "";

interface MyCharacterDetailModalsProviderProps {
  children: React.ReactNode;
}
export function MyCharacterDetailModalsProvider(props: MyCharacterDetailModalsProviderProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const [switchedArtifactI, setSwitchedArtifactI] = useState(-1);
  const { data } = useMyCharacterDetailInfo();

  const closeModal = () => setModalType("");

  const control: MyCharacterDetailModalsControl = useMemo(() => {
    return {
      requestSwitchCharacter: () => {
        setModalType("SWITCH_CHARACTER");
      },
      requestSwitchWeapon: () => {
        setModalType("SWITCH_WEAPON");
      },
      requestSwitchArtifact: (index) => {
        setModalType("SWITCH_ARTIFACT");
        setSwitchedArtifactI(index);
      },
      requestRemoveCharacter: () => {
        setModalType("REMOVE_CHARACTER");
      },
    };
  }, []);

  const renderModals = () => {
    if (!data) return null;
    const { character, weapon, artifacts } = data;

    return (
      <>
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
            dispatch(viewCharacter(character.name));
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
          currentArtifacts={artifacts}
          forcedType={ARTIFACT_TYPES[switchedArtifactI]}
          owner={character.name}
          buttonText="Switch"
          onClickButton={(selectedArtifact) => {
            dispatch(
              switchArtifact({
                newOwner: selectedArtifact.owner,
                newID: selectedArtifact.ID,
                oldOwner: character.name,
                oldID: artifacts[switchedArtifactI]?.ID || 0,
                artifactIndex: switchedArtifactI,
              })
            );
          }}
          onClose={closeModal}
        />
      </>
    );
  };

  return (
    <MyCharacterDetailModalsContext.Provider value={control}>
      {props.children}
      {data ? renderModals() : null}
    </MyCharacterDetailModalsContext.Provider>
  );
}
