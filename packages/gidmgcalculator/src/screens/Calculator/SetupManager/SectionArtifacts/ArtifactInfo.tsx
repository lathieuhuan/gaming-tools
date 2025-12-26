import { useState } from "react";
import { FaSave, FaSyncAlt, FaToolbox } from "react-icons/fa";
import { Button, PouchSvg, TrashCanSvg, VersatileSelect } from "rond";

import { useTranslation } from "@/hooks";
import { Artifact } from "@/models/base";
import { suffixOf } from "@/utils";
import { removeArtifactPiece, updateArtifactPiece } from "@Store/calculator/actions";

// Component
import { ArtifactLevelSelect, ArtifactSubstatsControl } from "@/components";
import { SaveConfirmModal } from "./SaveConfirmModal";

export type ArtifactSourceType = "LOADOUT" | "INVENTORY" | "FORGE";

type ArtifactInfoProps = {
  artifact: Artifact;
  onRemove?: () => void;
  onRequestChange: (source: ArtifactSourceType) => void;
};

export function ArtifactInfo({ artifact, onRemove, onRequestChange }: ArtifactInfoProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  const { rarity = 5, mainStatType } = artifact;

  const mainStatOptions = artifact.possibleMainStatTypes.map((type) => ({
    label: t(type),
    value: type,
  }));

  const closeModal = () => {
    setIsSaving(false);
  };

  const handleRemove = () => {
    removeArtifactPiece(artifact.type);
    onRemove?.();
  };

  return (
    <div className="pt-4 px-2 space-y-2" onDoubleClick={() => console.log(artifact)}>
      <div className="pl-1 flex items-start gap-4">
        <ArtifactLevelSelect
          mutable
          rarity={rarity}
          level={artifact.level}
          maxLevel={rarity === 5 ? 20 : 16}
          onChangeLevel={(level) => updateArtifactPiece(artifact.type, { level })}
        />

        <div className="w-full flex flex-col">
          {artifact.type === "flower" || artifact.type === "plume" ? (
            <p className="pl-6 py-1 text-lg">{t(mainStatType)}</p>
          ) : (
            <VersatileSelect
              title="Select Main-stat"
              className="h-9 text-lg"
              transparent
              arrowAt="start"
              options={mainStatOptions}
              value={mainStatType}
              onChange={(mainStatType) => updateArtifactPiece(artifact.type, { mainStatType })}
            />
          )}
          <p className={`pl-6 text-1.5xl leading-7 text-rarity-${rarity} font-bold`}>
            {artifact.mainStatValue}
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
        onChangeSubStat={(index, changeInfo) => {
          updateArtifactPiece(artifact.type, { subStat: { index, ...changeInfo } });
        }}
      />

      <div className="px-2 pt-2 pb-1 flex justify-end items-center gap-4">
        <Button title="Remove" icon={<TrashCanSvg />} onClick={handleRemove} />
        <Button
          title="Save"
          icon={<FaSave className="text-lg" />}
          onClick={() => setIsSaving(true)}
        />
        <Button
          title="Loadout"
          icon={<FaToolbox className="text-lg" />}
          onClick={() => onRequestChange("LOADOUT")}
        />
        <Button
          title="Inventory"
          icon={<PouchSvg className="text-xl" />}
          onClick={() => onRequestChange("INVENTORY")}
        />
        <Button
          title="Switch"
          icon={<FaSyncAlt className="text-lg" />}
          onClick={() => onRequestChange("FORGE")}
        />
      </div>

      <SaveConfirmModal active={isSaving} artifact={artifact} onClose={closeModal} />
    </div>
  );
}
