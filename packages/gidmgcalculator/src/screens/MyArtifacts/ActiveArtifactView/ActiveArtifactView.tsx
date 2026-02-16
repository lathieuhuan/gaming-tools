import { useState } from "react";
import { ConfirmModal, TrashCanSvg } from "rond";

import { Artifact } from "@/models/base";
import { useDispatch } from "@Store/hooks";
import {
  removeDbArtifact,
  swapArtifactOwner,
  updateDbArtifact,
  updateDbArtifactSubStat,
} from "@Store/userdb-slice";

// Components
import { ArtifactCard, Tavern } from "@/components";
import { ReforgeButton } from "./ReforgeButton";

type NewOwner = {
  name: string;
  code: number;
};

type ActiveArtifactViewProps = {
  artifact?: Artifact;
  onRemoveArtifact?: (artifact: Artifact) => void;
};

export function ActiveArtifactView({ artifact, onRemoveArtifact }: ActiveArtifactViewProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<"REMOVE_ARTIFACT" | "EQUIP_CHARACTER" | "">("");
  const [newOwner, setNewOwner] = useState<NewOwner>();

  const closeModal = () => setModalType("");

  const swapOwner = (code: number) => {
    if (artifact?.ID) {
      dispatch(swapArtifactOwner({ newOwner: code, artifactID: artifact.ID }));
    }
  };

  const handleConfirmRemove = (artifact: Artifact) => {
    dispatch(removeDbArtifact({ ID: artifact.ID }));
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
          dispatch(updateDbArtifact({ ID: artifact.ID, level }));
        }}
        onChangeMainStatType={(type, artifact) => {
          dispatch(
            updateDbArtifact({
              ID: artifact.ID,
              mainStatType: type,
            })
          );
        }}
        onChangeSubStat={(subStatIndex, changes, artifact) => {
          dispatch(
            updateDbArtifactSubStat({
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
        filter={(character) => character.code !== artifact?.owner}
        onSelectCharacter={(character) => {
          if (artifact?.owner) {
            setNewOwner(character.data);
            return;
          }

          swapOwner(character.data.code);
        }}
        onClose={closeModal}
      />

      <ConfirmModal
        active={!!newOwner}
        message={
          <>
            <b>{artifact?.owner}</b> is currently using this artifact. Equip to{" "}
            <b>{newOwner?.name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => newOwner && swapOwner(newOwner.code)}
        onClose={() => setNewOwner(undefined)}
      />

      {artifact && (
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
      )}
    </>
  );
}
