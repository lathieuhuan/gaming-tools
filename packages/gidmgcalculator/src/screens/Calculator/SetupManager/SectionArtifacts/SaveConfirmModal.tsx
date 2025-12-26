import { useRef } from "react";
import isEqual from "react-fast-compare";
import { ConfirmModal, Modal } from "rond";

import type { Artifact } from "@/models/base";

import { MAX_USER_ARTIFACTS } from "@/constants/config";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import { useDispatch } from "@Store/hooks";
import { addUserArtifact, selectDbArtifacts, updateUserArtifact } from "@Store/userdb-slice";

type SaveConfirmProps = {
  artifact: Artifact;
  onClose: () => void;
};

function SaveConfirm({ artifact, onClose }: SaveConfirmProps) {
  const dispatch = useDispatch();
  const state = useRef<"SUCCESS" | "PENDING" | "EXCEED_MAX" | "">("");

  const userArtifacts = useStoreSnapshot(selectDbArtifacts);
  const existedArtifact = Array_.findById(userArtifacts, artifact.ID);

  if (state.current === "") {
    if (userArtifacts.length + 1 > MAX_USER_ARTIFACTS) {
      state.current = "EXCEED_MAX";
    } else if (existedArtifact) {
      state.current = "PENDING";
    } else {
      dispatch(addUserArtifact(artifact));
      state.current = "SUCCESS";
    }
  }

  switch (state.current) {
    case "SUCCESS":
    case "EXCEED_MAX":
      return (
        <ConfirmModal.Body
          message={
            state.current === "SUCCESS"
              ? "Successfully saved to My Artifacts."
              : "You're having to many Artifacts. Please remove some of them first."
          }
          focusConfirm
          showCancel={false}
          onConfirm={onClose}
        />
      );
    case "PENDING": {
      const inform = (
        <>
          This artifact is already saved
          {existedArtifact?.owner ? (
            <>
              , and currently used by <b>{existedArtifact.owner}</b>
            </>
          ) : null}
          .
        </>
      );
      const noChange = existedArtifact
        ? isEqual(artifact.serialize(), {
            ...existedArtifact,
            ID: artifact.ID,
          })
        : false;

      const addNew = () => {
        dispatch(
          addUserArtifact({
            ...artifact.serialize(),
            ID: Date.now(),
          })
        );
        onClose();
      };

      if (noChange) {
        return (
          <ConfirmModal.Body
            message={<>{inform} Nothing has changed.</>}
            showCancel={false}
            focusConfirm
            moreActions={[
              {
                children: "Duplicate",
                onClick: addNew,
              },
            ]}
            onConfirm={onClose}
          />
        );
      }

      const overwrite = () => {
        dispatch(updateUserArtifact(artifact.serialize()));
        onClose();
      };

      return (
        <ConfirmModal.Body
          message={<>{inform} Their stats are different. Do you want to overwrite?</>}
          moreActions={[
            {
              children: "Add new",
              onClick: addNew,
            },
          ]}
          confirmText="Overwrite"
          onConfirm={overwrite}
          onCancel={onClose}
        />
      );
    }
    default:
      return null;
  }
}

export const SaveConfirmModal = Modal.coreWrap(SaveConfirm, { preset: "small" });
