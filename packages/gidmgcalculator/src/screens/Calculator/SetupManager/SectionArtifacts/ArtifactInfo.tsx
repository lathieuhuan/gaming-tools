import { useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { FaSave, FaTrashAlt, FaChevronDown, FaToolbox } from "react-icons/fa";
import { MdInventory } from "react-icons/md";
import { GiAnvil } from "react-icons/gi";
import { Modal, ConfirmModal, Button } from "rond";

import type { CalcArtifact, AttributeStat } from "@Src/types";
import { findById, suffixOf, Item_, Artifact_ } from "@Src/utils";
import { MAX_USER_ARTIFACTS } from "@Src/constants";
import { changeArtifact, updateArtifact } from "@Store/calculator-slice";
import { selectUserArtifacts, addUserArtifact, updateUserArtifact } from "@Store/userdb-slice";

// Hook
import { useDispatch } from "@Store/hooks";
import { useTranslation } from "@Src/hooks";
import { useStoreSnapshot } from "@Src/features";

// Component
import { ArtifactLevelSelect, ArtifactSubstatsControl } from "@Src/components";

export type ArtifactSourceType = "LOADOUT" | "INVENTORY" | "FORGE";

interface ArtifactInfoProps {
  artifact: CalcArtifact;
  pieceIndex: number;
  onRemove: () => void;
  onRequestChange: (source: ArtifactSourceType) => void;
}
export function ArtifactInfo({ artifact, pieceIndex, onRemove, onRequestChange }: ArtifactInfoProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isSaving, setIsSaving] = useState(false);

  const { type, rarity = 5, level, mainStatType } = artifact;
  const availableMainStatTypes = Artifact_.possibleMainStatTypesOf(type);
  const mainStatValue = Artifact_.mainStatValueOf(artifact);

  const closeModal = () => {
    setIsSaving(false);
  };

  return (
    <div className="pt-4 px-2 space-y-2" onDoubleClick={() => console.log(artifact)}>
      <div className="pl-2 flex items-start">
        <ArtifactLevelSelect
          mutable
          rarity={rarity}
          level={level}
          maxLevel={rarity === 5 ? 20 : 16}
          onChangeLevel={(level) => {
            dispatch(updateArtifact({ pieceIndex, level }));
          }}
        />

        <div className="ml-4">
          {type === "flower" || type === "plume" ? (
            <p className="pl-6 py-1 text-lg">{t(mainStatType)}</p>
          ) : (
            <div className="py-1 relative">
              <FaChevronDown className="absolute top-1/2 -translate-y-1/2 left-0" />
              <select
                className="pl-6 text-lg text-light-400 appearance-none relative z-10"
                value={mainStatType}
                onChange={(e) =>
                  dispatch(
                    updateArtifact({
                      pieceIndex,
                      mainStatType: e.target.value as AttributeStat,
                    })
                  )
                }
              >
                {Object.keys(availableMainStatTypes).map((type) => (
                  <option key={type} value={type}>
                    {t(type)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className={`pl-6 text-2xl leading-7 text-rarity-${rarity} font-bold`}>
            {mainStatValue}
            {suffixOf(mainStatType)}
          </p>
        </div>
      </div>

      <ArtifactSubstatsControl
        key={artifact.ID}
        mutable
        rarity={rarity}
        mainStatType={mainStatType}
        subStats={artifact.subStats}
        onChangeSubStat={(subStatIndex, changeInfo) => {
          dispatch(
            updateArtifact({
              pieceIndex,
              subStat: {
                index: subStatIndex,
                newInfo: changeInfo,
              },
            })
          );
        }}
      />

      <div className="px-2 pt-4 pb-1 flex justify-end items-center gap-4">
        <Button
          title="Remove"
          icon={<FaTrashAlt />}
          onClick={() => {
            dispatch(changeArtifact({ pieceIndex, newPiece: null }));
            onRemove();
          }}
        />
        <Button title="Save" icon={<FaSave />} onClick={() => setIsSaving(true)} />
        <Button title="Loadout" icon={<FaToolbox />} onClick={() => onRequestChange("LOADOUT")} />
        <Button title="Inventory" icon={<MdInventory />} onClick={() => onRequestChange("INVENTORY")} />
        <Button title="New" icon={<GiAnvil className="text-lg" />} onClick={() => onRequestChange("FORGE")} />
      </div>

      <Modal.Core active={isSaving} preset="small" onClose={closeModal}>
        <ConfirmSaving artifact={artifact} onClose={closeModal} />
      </Modal.Core>
    </div>
  );
}

interface ConfirmSavingProps {
  artifact: CalcArtifact;
  onClose: () => void;
}
function ConfirmSaving({ artifact, onClose }: ConfirmSavingProps) {
  const dispatch = useDispatch();
  const state = useRef<"SUCCESS" | "PENDING" | "EXCEED_MAX" | "">("");

  const userArtifacts = useStoreSnapshot(selectUserArtifacts);
  const existedArtifact = findById(userArtifacts, artifact.ID);

  if (state.current === "") {
    if (userArtifacts.length + 1 > MAX_USER_ARTIFACTS) {
      state.current = "EXCEED_MAX";
    } else if (existedArtifact) {
      state.current = "PENDING";
    } else {
      dispatch(addUserArtifact(Item_.calcItemToUserItem(artifact)));
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
        ? isEqual(artifact, {
            ...Item_.userItemToCalcItem(existedArtifact),
            ID: artifact.ID,
          })
        : false;

      const addNew = () => {
        dispatch(addUserArtifact(Item_.calcItemToUserItem(artifact, { ID: Date.now() })));
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
        dispatch(updateUserArtifact(Item_.calcItemToUserItem(artifact)));
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
