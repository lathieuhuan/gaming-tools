import { Fragment, useState } from "react";
import { Button, clsx, ConfirmModal } from "rond";
import { MdEdit } from "react-icons/md";

import { UserArtifact } from "@Src/types";
import { $AppArtifact } from "@Src/services";
import { useDispatch } from "@Store/hooks";
import { removeArtifact, swapArtifactOwner, updateUserArtifact, updateUserArtifactSubStat } from "@Store/userdb-slice";

// Components
import { ArtifactCard, Tavern } from "@Src/components";
import { IconTrashCan } from "@Src/components/icons";

interface ChosenArtifactViewProps {
  artifact?: UserArtifact;
  onRemoveArtifact?: (artifact: UserArtifact) => void;
  onRequestEditArtifact?: () => void;
}
export function ChosenArtifactView({ artifact, onRemoveArtifact, onRequestEditArtifact }: ChosenArtifactViewProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<"REMOVE_ARTIFACT" | "EQUIP_CHARACTER" | "">("");
  const [newOwner, setNewOwner] = useState("");

  const closeModal = () => setModalType("");

  const swapOwner = (name: string) => {
    if (artifact?.ID) {
      dispatch(swapArtifactOwner({ newOwner: name, artifactID: artifact.ID }));
    }
  };

  return (
    <Fragment>
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
        action={
          <Button
            title="Reforge"
            icon={<MdEdit className="text-lg text-black opacity-80" />}
            boneOnly
            className={clsx("shrink-0", artifact?.owner || artifact?.setupIDs?.length ? "hidden" : "")}
            onClick={() => onRequestEditArtifact?.()}
          />
        }
        actions={[
          {
            title: "Discard",
            icon: <IconTrashCan />,
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
          artifact?.owner ? setNewOwner(character.name) : swapOwner(character.name);
        }}
        onClose={closeModal}
      />

      {artifact ? (
        <ConfirmModal
          active={newOwner !== ""}
          message={
            <>
              <b>{artifact.owner}</b> is currently using "<b>{$AppArtifact.get(artifact)?.name || "<name missing>"}</b>
              ". Swap?
            </>
          }
          focusConfirm
          onConfirm={() => swapOwner(newOwner)}
          onClose={() => setNewOwner("")}
        />
      ) : null}

      {artifact ? (
        <ConfirmModal
          active={modalType === "REMOVE_ARTIFACT"}
          danger
          message={
            <>
              Remove "<b>{$AppArtifact.getSet(artifact.code)?.name}</b>" ({artifact.type})?{" "}
              {artifact.owner ? (
                <>
                  It is currently used by <b>{artifact.owner}</b>.
                </>
              ) : null}
            </>
          }
          focusConfirm
          onConfirm={() => {
            dispatch(removeArtifact(artifact));
            onRemoveArtifact?.(artifact);
          }}
          onClose={closeModal}
        />
      ) : null}
    </Fragment>
  );
}
