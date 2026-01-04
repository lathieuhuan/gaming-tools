import { RefCallback } from "react";
import { FaCopy, FaPlus, FaSave } from "react-icons/fa";

import type { ArtifactSavingStep } from "./_types";

import { createArtifact } from "@/utils/entity";

import { ArtifactCard } from "@/components";
import { SavingStepLayout } from "../_components/SavingStepLayout";

type SaveArtifactStepProps = {
  className?: string;
  step: ArtifactSavingStep;
  ctaRef?: RefCallback<HTMLButtonElement>;
  // onAction?: (output: NonNullable<SaveOutput["artifact"]>) => void;
};

export function SaveArtifactStep({ className, step, ctaRef }: SaveArtifactStepProps) {
  const { data: artifact, sameArtifacts } = step;

  if (sameArtifacts.length) {
    // Exact match
    if (sameArtifacts.some((atf) => atf.owner && atf.owner === artifact.owner)) {
      return (
        <SavingStepLayout
          className={className}
          message="This artifact has already been saved."
          continueRef={ctaRef}
          actions={[
            {
              children: "Duplicate",
              icon: <FaCopy />,
              onClick: () => {
                //
              },
            },
          ]}
          onContinue={() => {
            //
          }}
        >
          <ArtifactCard artifact={createArtifact(artifact)} />
        </SavingStepLayout>
      );
    }

    // Same but different or no owner

    return (
      <SavingStepLayout
        className={className}
        message="We found some saved artifacts that are as same as this one. Users are recommended to re-use them."
        actions={[
          {
            children: "Add new",
            icon: <FaPlus />,
            onClick: () => {
              //
            },
          },
        ]}
        onContinue={() => {
          //
        }}
      >
        <div className="grow space-y-2">
          {sameArtifacts.map((atf, index) => (
            <div
              key={atf.ID}
              className="px-4 py-2 bg-dark-1 rounded-md flex items-center justify-between"
            >
              <div className="flex items-end gap-2">
                Artifact {index + 1}
                <span className="text-dark-line">|</span>
                <span className="text-sm">
                  <span className="text-light-4">Owner:</span>{" "}
                  {atf.owner || <span className="text-light-hint">none</span>}
                </span>
              </div>

              {/* {attached && (
                <button className="text-primary-2">{atf.owner ? "Take" : "Equip"}</button>
              )} */}
            </div>
          ))}
        </div>
      </SavingStepLayout>
    );
  }

  return (
    <SavingStepLayout
      className={className}
      message="No same artifacts have been saved. This is a new one."
      actions={[
        {
          refProp: ctaRef,
          children: "Save",
          icon: <FaSave />,
          onClick: () => {
            //
          },
        },
      ]}
      onContinue={() => {
        //
      }}
    >
      <ArtifactCard artifact={artifact} />
    </SavingStepLayout>
  );
}
