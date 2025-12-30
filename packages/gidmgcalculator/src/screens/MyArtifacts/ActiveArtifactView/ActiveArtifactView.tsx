import { useState } from "react";
import { ConfirmModal, TrashCanSvg } from "rond";

import { Artifact } from "@/models/base";
import { useDispatch } from "@Store/hooks";
import {
  removeArtifact,
  swapArtifactOwner,
  updateUserArtifact,
  updateUserArtifactSubStat,
} from "@Store/userdb-slice";

// Components
import { ArtifactCard, Tavern } from "@/components";
import { ReforgeButton } from "./ReforgeButton";

type ActiveArtifactViewProps = {
  artifact?: Artifact;
  onRemoveArtifact?: (artifact: Artifact) => void;
};

export function ActiveArtifactView({ artifact, onRemoveArtifact }: ActiveArtifactViewProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<"REMOVE_ARTIFACT" | "EQUIP_CHARACTER" | "">("");
  const [newOwner, setNewOwner] = useState("");

  const closeModal = () => setModalType("");

  const swapOwner = (name: string) => {
    if (artifact?.ID) {
      dispatch(swapArtifactOwner({ newOwner: name, artifactID: artifact.ID }));
    }
  };

  const handleConfirmRemove = (artifact: Artifact) => {
    dispatch(removeArtifact({ ID: artifact.ID }));
    onRemoveArtifact?.(artifact);
  };

  return (
    <>
      <ArtifactCard
        wrapperCls="w-76 shrink-0"
        artifact={artifact}
        mutable
        withOwnerLabel
        onEnhance={(level, artifact) => {
          dispatch(updateUserArtifact({ ID: artifact.ID, level }));
        }}
        onChangeMainStatType={(type, artifact) => {
          dispatch(
            updateUserArtifact({
              ID: artifact.ID,
              mainStatType: type,
            })
          );
        }}
        onChangeSubStat={(subStatIndex, changes, artifact) => {
          dispatch(
            updateUserArtifactSubStat({
              ID: artifact.ID,
              subStatIndex,
              ...changes,
            })
          );
        }}
        headerAction={
          !artifact?.owner && !artifact?.setupIDs?.length ? (
            <ReforgeButton artifact={artifact} />
          ) : null
        }
        actions={[
          {
            title: "Discard",
            icon: <TrashCanSvg />,
            onClick: () => setModalType("REMOVE_ARTIFACT"),
          },
          {
            title: "Equip",
            children: "Equip",
            onClick: () => setModalType("EQUIP_CHARACTER"),
          },
        ]}
      />

      <Tavern
        active={modalType === "EQUIP_CHARACTER" && !!artifact}
        sourceType="user"
        filter={(character) => character.name !== artifact?.owner}
        onSelectCharacter={(character) => {
          const name = character.data.name;

          artifact?.owner ? setNewOwner(name) : swapOwner(name);
        }}
        onClose={closeModal}
      />

      <ConfirmModal
        active={newOwner !== ""}
        message={
          <>
            <b>{artifact?.owner}</b> is currently using this artifact. Equip to <b>{newOwner}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => swapOwner(newOwner)}
        onClose={() => setNewOwner("")}
      />

      {artifact ? (
        <ConfirmModal
          active={modalType === "REMOVE_ARTIFACT"}
          danger
          message={
            <>
              Remove "<b>{artifact.data.name}</b>" ({artifact.type})?{" "}
              {artifact.owner ? (
                <>
                  It is currently used by <b>{artifact.owner}</b>.
                </>
              ) : null}
            </>
          }
          focusConfirm
          onConfirm={() => handleConfirmRemove(artifact)}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}
