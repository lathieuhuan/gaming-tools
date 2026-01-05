import { RefCallback, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { FaPlus, FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Checkbox } from "rond";

import type { IArtifactBasic } from "@/types";
import type { ArtifactSaveOutput, ArtifactSavingStep } from "./_types";

import { createArtifact } from "@/utils/entity";
import Object_ from "@/utils/Object";

import { EquipmentIcon } from "@/assets/icons";
import { ArtifactCompareMenu } from "../_components/ArtifactCompareMenu";
import { ArtifactSummary } from "../_components/ArtifactSummary";
import { EntityComparer } from "../_components/EntityComparer";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { genNewEntityMessage } from "../_config";

const isSameArtifact = (artifact1: IArtifactBasic, artifact2: IArtifactBasic) => {
  return isEqual(
    Object_.pickProps(artifact1, ["level", "subStats"]),
    Object_.pickProps(artifact2, ["level", "subStats"])
  );
};

export type SaveArtifactStepProps = {
  className?: string;
  step: ArtifactSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onAction?: (output: ArtifactSaveOutput) => void;
};

export function SaveArtifactStep({ className, step, ctaRef, onAction }: SaveArtifactStepProps) {
  const { data: artifact, sameArtifacts } = step;

  const diffMap = useRef(new Map<number, boolean>());
  const [selectedArtifact, setSelectedArtifact] = useState<IArtifactBasic>();
  const [shouldUpdate, setShouldUpdate] = useState(true);

  const next = () => {
    onAction?.({
      action: "NONE",
      artifact: artifact.serialize(),
    });
  };

  if (!sameArtifacts.length) {
    return (
      <SavingStepLayout
        className={className}
        message={`${genNewEntityMessage("Artifact")} Press Continue save it.`}
        actions={[
          {
            refProp: ctaRef,
            children: "Continue",
            icon: <FaSave />,
            onClick: () => {
              onAction?.({
                action: "CREATE",
                artifact: artifact.serialize(),
              });
            },
          },
        ]}
        continueText="Skip"
        onContinue={next}
      >
        <ArtifactSummary label={artifact.data.name} artifact={artifact} />
      </SavingStepLayout>
    );
  }

  const current = sameArtifacts.find((atf) => atf.owner && atf.owner === artifact.owner);

  if (current) {
    if (isSameArtifact(current, artifact)) {
      // ===== EQUIPPED + UNCHANGED =====
      return (
        <SavingStepLayout
          className={className}
          message={`${artifact.owner} is already equipped with this artifact.`}
          continueRef={ctaRef}
          onContinue={next}
        >
          <ArtifactSummary label={artifact.data.name} artifact={artifact} />
        </SavingStepLayout>
      );
    }

    // ===== EQUIPPED + CHANGED =====
    return (
      <SavingStepLayout
        className={className}
        message={`${artifact.owner} seems to be equipped with the old version of this artifact.`}
        actions={[
          {
            children: "Update",
            icon: <MdEdit />,
            refProp: ctaRef,
            onClick: () => {
              onAction?.({
                action: "UPDATE",
                artifact: {
                  ...artifact.serialize(),
                  ID: current.ID,
                },
              });
            },
          },
          {
            children: "Add new",
            icon: <FaPlus />,
            onClick: () => {
              onAction?.({
                action: "CREATE",
                artifact: artifact.serialize(),
              });
            },
          },
        ]}
        continueText="Skip"
        onContinue={next}
      >
        <EntityComparer
          items={[
            {
              label: "Current",
              children: (
                <ArtifactSummary
                  label={artifact.data.name}
                  artifact={createArtifact(current, artifact.data)}
                />
              ),
            },
            {
              label: "To be saved",
              children: <ArtifactSummary label={artifact.data.name} artifact={artifact} />,
            },
          ]}
        />
      </SavingStepLayout>
    );
  }

  // ===== DIFFERENT LEVEL/SUBSTATS + NOT EQUIPPED =====

  const isDifferentToAtf = (comparedAtf: IArtifactBasic) => {
    const cachedDiff = diffMap.current.get(comparedAtf.ID);

    if (cachedDiff !== undefined) {
      return cachedDiff;
    }

    const isDiff = !isSameArtifact(comparedAtf, artifact);
    diffMap.current.set(comparedAtf.ID, isDiff);

    return isDiff;
  };

  const handleSelectSameArtifact = (artifact: IArtifactBasic) => {
    setSelectedArtifact(artifact);
    setShouldUpdate(true);
  };

  const handleEquip = () => {
    if (selectedArtifact) {
      onAction?.({
        action: "UPDATE",
        artifact: shouldUpdate
          ? {
              ...artifact.serialize(),
              ID: selectedArtifact.ID,
            }
          : selectedArtifact,
      });
    }
  };

  return (
    <SavingStepLayout
      className={className}
      message="We found some artifacts that are similar to this one. Users are recommended to re-use."
      actions={[
        {
          children: "Equip",
          icon: <EquipmentIcon className="text-xl" />,
          disabled: !selectedArtifact,
          onClick: handleEquip,
        },
        {
          children: "Add new",
          icon: <FaPlus />,
          onClick: () => {
            onAction?.({
              action: "CREATE",
              artifact: artifact.serialize(),
            });
          },
        },
      ]}
      continueText="Skip"
      onContinue={next}
    >
      <div className="h-full flex flex-col">
        <ArtifactCompareMenu
          className="grow custom-scrollbar"
          artifact={artifact}
          sameArtifacts={sameArtifacts}
          onSelect={handleSelectSameArtifact}
        />

        {selectedArtifact && isDifferentToAtf(selectedArtifact) && (
          <div>
            <Checkbox checked={shouldUpdate} onChange={() => setShouldUpdate(!shouldUpdate)}>
              <span>Also update the selected artifact</span>
            </Checkbox>
          </div>
        )}
      </div>
    </SavingStepLayout>
  );
}
