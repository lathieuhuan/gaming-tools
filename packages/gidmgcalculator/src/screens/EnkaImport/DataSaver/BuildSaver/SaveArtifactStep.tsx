import { RefCallback, useMemo } from "react";
import isEqual from "react-fast-compare";
import { FaCopy, FaPlus, FaSave } from "react-icons/fa";
import { Button } from "rond";

import type { IArtifactBasic } from "@/types";
import type { ArtifactSavingStep } from "./_types";

import { useStore } from "@/systems/dynamic-store";
import { createArtifact } from "@/utils/entity";
import IdStore from "@/utils/IdStore";
import Object_ from "@/utils/Object";

import { ArtifactCard } from "@/components";
import { SavingStepLayout } from "../_components/SavingStepLayout";

type SaveArtifactStepProps = Omit<ArtifactSavingStep, "type"> & {
  className?: string;
  store: ReturnType<typeof useStore>;
  idStore: IdStore;
  ctaRef?: RefCallback<HTMLButtonElement>;
  onSave?: (artifact: IArtifactBasic) => void;
  onSkip?: () => void;
};

export function SaveArtifactStep({
  className,
  data: artifact,
  sameArtifacts = [],
  store,
  idStore,
  ctaRef,
  onSave,
  onSkip,
}: SaveArtifactStepProps) {
  // const sameArtifacts = useMemo(() => {
  //   const userArts = store.select((state) => state.userdb.userArts);
  //   return userArts.filter((userArt) => areSameArtifacts(userArt, artifact));
  // }, []);

  const getArtifactBasic = () => {
    const { owner, ...artifactToSave } = artifact.serialize();
    return artifactToSave;
  };

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
              onClick: () =>
                onSave?.({
                  ...getArtifactBasic(),
                  ID: idStore.gen(),
                }),
            },
          ]}
          onContinue={onSkip}
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
            onClick: () =>
              onSave?.({
                ...getArtifactBasic(),
                ID: idStore.gen(),
              }),
          },
        ]}
        onContinue={onSkip}
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
          onClick: () => onSave?.(getArtifactBasic()),
        },
      ]}
      onContinue={onSkip}
    >
      <ArtifactCard artifact={artifact} />
    </SavingStepLayout>
  );
}
