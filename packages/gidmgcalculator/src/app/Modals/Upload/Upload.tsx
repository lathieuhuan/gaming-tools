import { useEffect, useRef, useState } from "react";
import { Modal, notification, type ModalControl } from "rond";

import type { CurrentDatabaseData } from "@/migration/types/current";
import type { RawArtifact, RawWeapon } from "@/types";

import { MAX_USER_ARTIFACTS, MAX_USER_WEAPONS } from "@/constants/config";
import { useDispatch } from "@Store/hooks";
import { addUserDatabase } from "@Store/userdbSlice";

// Component
import { ItemMultiSelect, ItemMultiSelectIds } from "@/components";
import { FileUpload } from "./FileUpload";

// const MAX_USER_WEAPONS = 3;
// const MAX_USER_ARTIFACTS = 3;

export type UploadStep = "SELECT_OPTION" | "CHECK_WEAPONS" | "CHECK_ARTIFACTS" | "FINISH";

function Upload({ onClose }: ModalControl) {
  const dispatch = useDispatch();
  const uploadSteps = useRef<UploadStep[]>(["SELECT_OPTION"]);
  const uploadedData = useRef<CurrentDatabaseData>();
  const removedWeaponIDs = useRef<ItemMultiSelectIds>(new Set());
  const removedArtifactIDs = useRef<ItemMultiSelectIds>(new Set());
  const notiId = useRef<number>();

  const [stepNo, setStepNo] = useState(-1);

  const currentStep = uploadSteps.current[stepNo];
  const { weapons = [], artifacts = [] } = uploadedData.current || {};
  const selectingWeapons = currentStep === "CHECK_WEAPONS";
  const selectingArtifacts = currentStep === "CHECK_ARTIFACTS";
  let filteredWeapons: RawWeapon[] = [];
  let filteredArtifacts: RawArtifact[] = [];

  if (selectingWeapons) {
    filteredWeapons = weapons.filter((weapon) => !weapon.owner && !weapon.setupIDs?.length);
  }
  if (selectingArtifacts) {
    filteredArtifacts = artifacts.filter(
      (artifact) => !artifact.owner && !artifact.setupIDs?.length
    );
  }

  useEffect(() => {
    setStepNo(0);
  }, []);

  const handleClose = (atStep: UploadStep) => () => {
    if (atStep === currentStep) {
      setStepNo(-1);

      if (notiId.current !== undefined) {
        notification.destroy(notiId.current);
      }

      onClose && setTimeout(onClose, 150);
    }
  };

  const toNextStep = () => {
    if (notiId.current !== undefined) {
      notification.destroy(notiId.current);
      notiId.current = undefined;
    }

    if (stepNo !== uploadSteps.current.length - 1) {
      const nextStepNo = stepNo + 1;
      const key: string = uploadSteps.current[nextStepNo];
      const itemType = {
        CHECK_WEAPONS: "weapons",
        CHECK_ARTIFACTS: "artifacts",
      }[key];

      setStepNo(nextStepNo);

      notiId.current = notification.warn({
        content: `Too many ${itemType}! Please select ${itemType} to be left out.`,
        duration: 0,
      });

      return;
    }

    notification.success({
      content: "Successfully uploaded your data!",
    });

    const { weapons = [], artifacts = [] } = uploadedData.current || {};
    const dbWeapons = removedWeaponIDs.current.size
      ? weapons.filter((weapon) => !removedWeaponIDs.current.has(weapon.ID))
      : weapons;
    const dbArtifacts = removedArtifactIDs.current.size
      ? artifacts.filter((artifact) => !removedArtifactIDs.current.has(artifact.ID))
      : artifacts;

    dispatch(
      addUserDatabase({
        ...uploadedData.current,
        weapons: dbWeapons,
        artifacts: dbArtifacts,
      })
    );

    handleClose(currentStep)();
  };

  return (
    <>
      <Modal
        preset="small"
        title="Upload"
        className="bg-dark-1"
        active={currentStep === "SELECT_OPTION"}
        onClose={handleClose("SELECT_OPTION")}
      >
        <FileUpload
          onSuccessUploadFile={(data) => {
            uploadedData.current = data;

            if (data.weapons.length > MAX_USER_WEAPONS) {
              uploadSteps.current.push("CHECK_WEAPONS");
            }
            if (data.artifacts.length > MAX_USER_ARTIFACTS) {
              uploadSteps.current.push("CHECK_ARTIFACTS");
            }

            toNextStep();
          }}
        />
      </Modal>

      <ItemMultiSelect
        title="Weapons"
        active={currentStep === "CHECK_WEAPONS"}
        items={filteredWeapons}
        required={weapons.length - MAX_USER_WEAPONS}
        onConfirm={(data) => {
          removedWeaponIDs.current = data;
          toNextStep();
        }}
        onClose={handleClose("CHECK_WEAPONS")}
      />

      <ItemMultiSelect
        title="Artifacts"
        active={currentStep === "CHECK_ARTIFACTS"}
        items={filteredArtifacts}
        required={artifacts.length - MAX_USER_ARTIFACTS}
        onConfirm={(data) => {
          removedArtifactIDs.current = data;
          toNextStep();
        }}
        onClose={handleClose("CHECK_ARTIFACTS")}
      />
    </>
  );
}

export function UploadModals(props: ModalControl) {
  return props.active ? <Upload {...props} /> : null;
}
