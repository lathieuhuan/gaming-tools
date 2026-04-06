import { RefCallback, useState } from "react";
import { FaAngleDoubleRight, FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { ButtonProps, Checkbox, notification } from "rond";

import type { Artifact } from "@/models";
import type { RawArtifact } from "@/types";
import type { ArtifactSaveOutput, ArtifactSavingStep } from "./types";

import { useStoreCheck } from "@/hooks/useStoreCheck";
import { genCaseConfigs } from "../config";
import { isExactArtifact, isSameArtifact } from "../logic";

import { EquipmentIcon } from "@/assets/icons";
import { CaseNewArtifact } from "../components/CaseNewArtifact";
import { CaseSameArtifacts } from "../components/CaseSameArtifact";
import { SavingCase } from "../components/SavingCase";
import { SavingStepLayout } from "../components/SavingStepLayout";
import { ArtifactSummary } from "../components/ArtifactSummary";

export type SaveArtifactStepProps = {
  className?: string;
  step: ArtifactSavingStep;
  savePendingCount?: number;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction: (output: ArtifactSaveOutput) => void;
};

export function SaveArtifactStep({
  className,
  step,
  savePendingCount = 0,
  ctaRef,
  onAction,
}: SaveArtifactStepProps) {
  const { data: artifact, currentArtifact, sameArtifacts } = step;
  const { isAbleToAddArtifact } = useStoreCheck();
  const [selectedArtifact, setSelectedArtifact] = useState<RawArtifact>();
  const [shouldUpdate, setShouldUpdate] = useState(true);

  const handleSelectArtifact = (artifact: RawArtifact) => {
    setSelectedArtifact(artifact);
    setShouldUpdate(true);
  };

  const handleCreate = () => {
    const error = isAbleToAddArtifact(savePendingCount + 1);

    if (error) {
      notification.error({ content: error.message });
      return;
    }

    onAction?.({
      action: "CREATE",
      artifact: artifact.serialize(),
    });
  };

  const handleUpdate = () => {
    if (selectedArtifact) {
      onAction?.({
        action: "UPDATE",
        artifact: {
          ...(shouldUpdate ? artifact.serialize() : selectedArtifact),
          owner: selectedArtifact.owner,
          ID: selectedArtifact.ID,
        },
      });
    }
  };

  const handleSkip = () => {
    onAction?.({
      action: "NONE",
      artifact: (currentArtifact || artifact).serialize(),
    });
  };

  let actions: ButtonProps[] = [];
  let showUpdateCheckbox = selectedArtifact && !isExactArtifact(selectedArtifact, artifact);

  if (currentArtifact || sameArtifacts.length) {
    const currentIsSelected = currentArtifact && currentArtifact.ID === selectedArtifact?.ID;

    actions.push(
      currentIsSelected
        ? {
            children: "Update",
            icon: <MdEdit />,
            hidden: !selectedArtifact,
            onClick: handleUpdate,
          }
        : {
            children: "Equip",
            icon: <EquipmentIcon className="text-xl" />,
            hidden: !selectedArtifact,
            onClick: handleUpdate,
          }
    );

    // We already Update button, do not need checkbox for this case
    showUpdateCheckbox = showUpdateCheckbox && !currentIsSelected;
  }

  const hasNoSameWeapons =
    (!currentArtifact || !isSameArtifact(currentArtifact, artifact)) && !sameArtifacts.length;

  const caseConfigs = genCaseConfigs("Artifact", {
    hasNoSameEntities: hasNoSameWeapons,
    withoutOwner: false,
  });

  return (
    <SavingStepLayout
      className={className}
      actions={actions.concat(
        {
          children: "Add new",
          icon: <FaPlus />,
          refProp: hasNoSameWeapons ? ctaRef : undefined,
          onClick: handleCreate,
        },
        {
          children: "Skip",
          icon: <FaAngleDoubleRight />,
          onClick: handleSkip,
        }
      )}
    >
      <div className="h-full flex flex-col">
        <div className="grow custom-scrollbar">
          <CaseNewArtifact {...caseConfigs.toSaveCase} artifact={artifact} />

          {currentArtifact && (
            <CaseCurrentArtifact
              currentArtifact={currentArtifact}
              isOldVersion={
                isSameArtifact(currentArtifact, artifact) &&
                !isExactArtifact(currentArtifact, artifact)
              }
              selected={selectedArtifact?.ID === currentArtifact.ID}
              onSelect={() => handleSelectArtifact(currentArtifact)}
            />
          )}

          {sameArtifacts.length > 0 && (
            <CaseSameArtifacts
              {...caseConfigs.sameCase}
              data={artifact.data}
              withDivider
              sameArtifacts={sameArtifacts}
              selectedArtifact={selectedArtifact}
              onSelectArtifact={handleSelectArtifact}
            />
          )}
        </div>

        {showUpdateCheckbox && (
          <div className="mt-4">
            <Checkbox checked={shouldUpdate} onChange={() => setShouldUpdate(!shouldUpdate)}>
              <span>Also update the selected artifact</span>
            </Checkbox>
          </div>
        )}
      </div>
    </SavingStepLayout>
  );
}

type CaseCurrentArtifactProps = {
  currentArtifact: Artifact;
  isOldVersion: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

function CaseCurrentArtifact({
  currentArtifact,
  isOldVersion,
  selected,
  onSelect,
}: CaseCurrentArtifactProps) {
  return (
    <SavingCase
      message={`${currentArtifact.owner} is currently equipped with this Artifact.`}
      hint={isOldVersion && "Select it to update."}
      withDivider
    >
      <ArtifactSummary
        variant="primary"
        label={`Current: ${currentArtifact.data.name}`}
        artifact={currentArtifact}
        selectable={isOldVersion}
        selected={selected}
        onSelect={onSelect}
      />
    </SavingCase>
  );
}
