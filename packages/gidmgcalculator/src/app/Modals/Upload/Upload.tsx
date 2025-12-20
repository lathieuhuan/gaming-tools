import { useState, useRef, useEffect } from "react";
import { notification, type ModalControl } from "rond";
import type { IDbArtifact, IDbWeapon } from "@/types";
import type { UploadedData, UploadStep } from "./types";

import { MAX_USER_ARTIFACTS, MAX_USER_WEAPONS } from "@/constants/config";
import { useDispatch } from "@Store/hooks";
import { addUserDatabase } from "@Store/userdb-slice";

// Component
import { ItemMultiSelect, ItemMultiSelectIds } from "@/components";
import { FileUpload } from "./components/FileUpload";

// const MAX_USER_WEAPONS = 3;
// const MAX_USER_ARTIFACTS = 3;

function UploadCore({ active, onClose }: ModalControl) {
  const dispatch = useDispatch();
  const uploadSteps = useRef<UploadStep[]>(["SELECT_OPTION"]);
  const uploadedData = useRef<UploadedData>();
  const removedWeaponIDs = useRef<ItemMultiSelectIds>(new Set());
  const removedArtifactIDs = useRef<ItemMultiSelectIds>(new Set());
  const notiId = useRef<number>();

  const [stepNo, setStepNo] = useState(-1);

  const currentStep = uploadSteps.current[stepNo];
  const { weapons = [], artifacts = [] } = uploadedData.current || {};
  const selectingWeapons = active && currentStep === "CHECK_WEAPONS";
  const selectingArtifacts = active && currentStep === "CHECK_ARTIFACTS";
  let filteredWeapons: IDbWeapon[] = [];
  let filteredArtifacts: IDbArtifact[] = [];

  if (selectingWeapons) {
    filteredWeapons = weapons.filter((weapon) => !weapon.owner && !weapon.setupIDs?.length);
  }
  if (selectingArtifacts) {
    filteredArtifacts = artifacts.filter((artifact) => !artifact.owner && !artifact.setupIDs?.length);
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

      setTimeout(onClose, 150);
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

    dispatch(
      addUserDatabase({
        ...uploadedData.current,
        weapons: weapons.filter((weapon) => !removedWeaponIDs.current.has(weapon.ID)),
        artifacts: artifacts.filter((artifact) => !removedArtifactIDs.current.has(artifact.ID)),
      })
    );

    handleClose(currentStep)();
  };

  return (
    <>
      <FileUpload
        active={active && currentStep === "SELECT_OPTION"}
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
        onClose={handleClose("SELECT_OPTION")}
      />
      <ItemMultiSelect
        title="Weapons"
        active={active && currentStep === "CHECK_WEAPONS"}
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
        active={active && currentStep === "CHECK_ARTIFACTS"}
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

export function Upload(props: ModalControl) {
  return props.active ? <UploadCore {...props} /> : null;
}
