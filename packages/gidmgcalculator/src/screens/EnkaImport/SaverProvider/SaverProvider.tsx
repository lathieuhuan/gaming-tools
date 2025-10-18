import { ReactNode, useId, useState } from "react";
import { Modal } from "rond";

import { ConvertedArtifact, ConvertedWeapon } from "@/services/app-data";
import { GenshinUserBuild } from "@/services/enka";
import { useStore } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { useDispatch } from "@Store/hooks";
import { updateUserWeapon } from "@Store/userdb-slice";
import { ExistedItems } from "./types";
import { SaverContext } from "./context";

import { SaveForm, SaveFormProps } from "./SaveForm";

type SaveModal = {
  active: boolean;
  build?: GenshinUserBuild;
  existedItems?: ExistedItems;
};

type SaverProviderProps = {
  children: ReactNode;
};

export function SaverProvider({ children }: SaverProviderProps) {
  const dispatch = useDispatch();
  const buildSaveFormId = useId();
  const store = useStore();
  const [saveModal, setSaveModal] = useState<SaveModal>({ active: false });

  const getExistedItems = (build: GenshinUserBuild) => {
    const userdb = store.select((state) => state.userdb);

    const result: ExistedItems = {
      character: userdb.userChars.find((char) => char.name === build.character.name),
      weapon: userdb.userWps.find((wp) => wp.ID === build.weapon.ID),
    };

    Array_.truthify(build.artifacts).forEach((artifact) => {
      result[artifact.type] = userdb.userArts.find((art) => art.ID === artifact.ID);
    });

    return Object.values(result).some(Boolean) ? result : undefined;
  };

  const closePendingModal = () => {
    setSaveModal((prev) => ({ ...prev, active: false }));
  };

  const handleSaveFormSubmit: SaveFormProps["onSubmit"] = (selections, build) => {
    // Get existed items again for the case user changed the userdb in other tabs
    const existedItems = getExistedItems(build);
    const characterName = build.character.name;

    if (selections.weapon === "OVERWRITE") {
      // There must be an existed weapon -> Update this weapon
      if (existedItems?.weapon) {
        const oldOwner = existedItems.weapon.owner;

        dispatch(
          updateUserWeapon({
            ...Object_.pickProps(build.weapon, ["ID", "level", "refi"]),
            owner: characterName,
          })
        );

        if (oldOwner) {
          //
        }
      }
    } else if (selections.weapon === "NEW") {
      // Add this weapon to userdb
    }
  };

  const saveWeapon = (weapon: ConvertedWeapon) => {
    //
  };

  const saveArtifact = (artifact: ConvertedArtifact) => {
    //
  };

  const save = (build: GenshinUserBuild, type?: "WEAPON" | number) => {
    if (type) {
      switch (type) {
        case "WEAPON":
          saveWeapon(build.weapon);
          return;
        default: {
          const artifact = build.artifacts[type];
          if (artifact) {
            saveArtifact(artifact);
          }
          return;
        }
      }
    }

    setSaveModal({
      active: true,
      build,
      existedItems: getExistedItems(build),
    });
  };

  return (
    <SaverContext.Provider value={{ save }}>
      {children}

      <Modal
        active={saveModal.active}
        title={
          <>
            <p>Save build</p>
            <p className="text-sm text-light-hint">
              Select save option for the character and items
            </p>
          </>
        }
        withHeaderDivider={false}
        withActions
        className="max-w-95/100 w-full bg-dark-1"
        formId={buildSaveFormId}
        onClose={closePendingModal}
      >
        {saveModal.build && (
          <SaveForm
            id={buildSaveFormId}
            className="h-[70vh]"
            build={saveModal.build}
            existedItems={saveModal.existedItems}
            onSubmit={handleSaveFormSubmit}
          />
        )}
      </Modal>
    </SaverContext.Provider>
  );
}
