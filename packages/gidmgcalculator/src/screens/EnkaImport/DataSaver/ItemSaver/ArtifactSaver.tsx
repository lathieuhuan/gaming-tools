import { useState } from "react";
import { FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { notification } from "rond";

import type { Artifact } from "@/models/base/Artifact";
import type { IArtifactBasic } from "@/types";

import { createArtifact } from "@/utils/entity";
import { useDispatch } from "@Store/hooks";
import { addUserArtifact, updateUserArtifact } from "@Store/userdb-slice";
import { CONTINUE_MSG, genNewEntityMessage, genSameEntityMessage } from "../_config";
import { isExactArtifact } from "../_utils";

import { ArtifactSummary } from "../_components/ArtifactSummary";
import { SaverLayout } from "../_components/SaverLayout";
import { SavingStepLayout } from "../_components/SavingStepLayout";

type ArtifactSaverProps = {
  artifact: Artifact;
  sameArtifacts: IArtifactBasic[];
  onComplete?: () => void;
};

export function ArtifactSaver({ artifact, sameArtifacts, onComplete }: ArtifactSaverProps) {
  const dispatch = useDispatch();
  const [selectedArtifact, setSelectedArtifact] = useState<IArtifactBasic>();

  const handleSave = () => {
    const { owner, ...artifactToSave } = artifact.serialize();

    dispatch(
      addUserArtifact({
        ...artifactToSave,
        ID: Date.now(),
      })
    );

    notification.success({
      content: "Artifact saved successfully!",
    });
    onComplete?.();
  };

  const handleUpdate = () => {
    if (!selectedArtifact) {
      return;
    }

    dispatch(
      updateUserArtifact({
        ID: selectedArtifact?.ID,
        level: artifact.level,
        subStats: artifact.subStats,
      })
    );

    notification.success({
      content: "Artifact updated successfully!",
    });
    onComplete?.();
  };

  if (sameArtifacts.length) {
    const message = genSameEntityMessage("Artifact");

    return (
      <SaverLayout type="ARTIFACT" atfType={artifact.type}>
        <SavingStepLayout
          className="grow"
          actions={[
            {
              children: "Cancel",
              icon: <FaTimes />,
              onClick: onComplete,
            },
            {
              children: "Update",
              icon: <MdEdit />,
              disabled: !selectedArtifact || isExactArtifact(selectedArtifact, artifact),
              onClick: handleUpdate,
            },
          ]}
          continueProps={{
            children: "Add new",
            icon: <FaPlus />,
          }}
          onContinue={handleSave}
        >
          <ArtifactSummary variant="primary" label={artifact.data.name} artifact={artifact} />

          <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />

          <p className="text-light-3 text-sm">{message.main}</p>
          <p className="mt-1 text-light-hint text-sm">{message.hint}</p>

          <div className="mt-2 space-y-2">
            {sameArtifacts.map((item, index) => (
              <ArtifactSummary
                key={item.ID}
                label={
                  <span>
                    <span>Artifact {index + 1}</span>{" "}
                    {item.owner && <span className="text-light-4">({item.owner})</span>}
                  </span>
                }
                artifact={createArtifact(item, artifact.data)}
                selectable
                selected={selectedArtifact?.ID === item.ID}
                onSelect={() => setSelectedArtifact(item)}
              />
            ))}
          </div>
        </SavingStepLayout>
      </SaverLayout>
    );
  }

  return (
    <SaverLayout type="ARTIFACT" atfType={artifact.type}>
      <SavingStepLayout
        className="grow"
        message={`${genNewEntityMessage("Artifact")} ${CONTINUE_MSG}`}
        actions={[
          {
            children: "Cancel",
            icon: <FaTimes />,
            onClick: onComplete,
          },
        ]}
        continueProps={{
          icon: <FaSave />,
          autoFocus: true,
        }}
        onContinue={handleSave}
      >
        <ArtifactSummary variant="primary" label={artifact.data.name} artifact={artifact} />
      </SavingStepLayout>
    </SaverLayout>
  );
}
