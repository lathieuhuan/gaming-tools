import { ArtifactCalc, AttributeStat } from "@Calculation";
import { useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { FaSave, FaSyncAlt, FaToolbox } from "react-icons/fa";
import { Button, ConfirmModal, Modal, PouchSvg, TrashCanSvg, VersatileSelect } from "rond";

import type { CalcArtifact } from "@/types";

import { MAX_USER_ARTIFACTS } from "@/constants";
import { useTranslation } from "@/hooks";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import { suffixOf } from "@/utils";
import Array_ from "@/utils/array-utils";
import Entity_ from "@/utils/entity-utils";
import { changeArtifact, updateArtifact } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";
import { addUserArtifact, selectUserArtifacts, updateUserArtifact } from "@Store/userdb-slice";

// Component
import { ArtifactLevelSelect, ArtifactSubstatsControl } from "@/components";

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
  const possibleMainStatTypes = ArtifactCalc.possibleMainStatTypesOf(type);
  const mainStatValue = ArtifactCalc.mainStatValueOf(artifact);

  const closeModal = () => {
    setIsSaving(false);
  };

  return (
    <div className="pt-4 px-2 space-y-2" onDoubleClick={() => console.log(artifact)}>
      <div className="pl-1 flex items-start gap-4">
        <ArtifactLevelSelect
          mutable
          rarity={rarity}
          level={level}
          maxLevel={rarity === 5 ? 20 : 16}
          onChangeLevel={(level) => {
            dispatch(updateArtifact({ pieceIndex, level }));
          }}
        />

        <div className="w-full flex flex-col">
          {type === "flower" || type === "plume" ? (
            <p className="pl-6 py-1 text-lg">{t(mainStatType)}</p>
          ) : (
            <VersatileSelect
              title="Select Main-stat"
              className="h-9 text-lg"
              transparent
              arrowAt="start"
              options={possibleMainStatTypes.map((type) => ({ label: t(type), value: type }))}
              value={mainStatType}
              onChange={(value) => {
                dispatch(
                  updateArtifact({
                    pieceIndex,
                    mainStatType: value as AttributeStat,
                  })
                );
              }}
            />
          )}
          <p className={`pl-6 text-1.5xl leading-7 text-rarity-${rarity} font-bold`}>
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

      <div className="px-2 pt-2 pb-1 flex justify-end items-center gap-4">
        <Button
          title="Remove"
          icon={<TrashCanSvg />}
          onClick={() => {
            dispatch(changeArtifact({ pieceIndex, newPiece: null }));
            onRemove();
          }}
        />
        <Button title="Save" icon={<FaSave className="text-lg" />} onClick={() => setIsSaving(true)} />
        <Button title="Loadout" icon={<FaToolbox className="text-lg" />} onClick={() => onRequestChange("LOADOUT")} />
        <Button
          title="Inventory"
          icon={<PouchSvg className="text-xl" />}
          onClick={() => onRequestChange("INVENTORY")}
        />
        <Button title="Switch" icon={<FaSyncAlt className="text-lg" />} onClick={() => onRequestChange("FORGE")} />
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
  const existedArtifact = Array_.findById(userArtifacts, artifact.ID);

  if (state.current === "") {
    if (userArtifacts.length + 1 > MAX_USER_ARTIFACTS) {
      state.current = "EXCEED_MAX";
    } else if (existedArtifact) {
      state.current = "PENDING";
    } else {
      dispatch(addUserArtifact(Entity_.calcItemToUserItem(artifact)));
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
            ...Entity_.userItemToCalcItem(existedArtifact),
            ID: artifact.ID,
          })
        : false;

      const addNew = () => {
        dispatch(addUserArtifact(Entity_.calcItemToUserItem(artifact, { ID: Date.now() })));
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
        dispatch(updateUserArtifact(Entity_.calcItemToUserItem(artifact)));
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
