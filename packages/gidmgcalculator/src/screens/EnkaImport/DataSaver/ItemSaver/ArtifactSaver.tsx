import { useState } from "react";
import { FaSave } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { notification } from "rond";

import type { Artifact } from "@/models";
import type { RawArtifact } from "@/types";

import { useStoreCheck } from "@/hooks/useStoreCheck";
import { useDispatch } from "@Store/hooks";
import { addDbArtifact, updateDbArtifact } from "@Store/userdbSlice";
import { genCaseConfigs } from "../config";
import { isExactArtifact } from "../logic";

import { CaseNewArtifact } from "../components/CaseNewArtifact";
import { CaseSameArtifacts } from "../components/CaseSameArtifact";
import { SaverLayout } from "../components/SaverLayout";
import { SavingStepLayout } from "../components/SavingStepLayout";

type ArtifactSaverProps = {
  artifact: Artifact;
  sameArtifacts: RawArtifact[];
  onComplete?: () => void;
};

export function ArtifactSaver({ artifact, sameArtifacts, onComplete }: ArtifactSaverProps) {
  const dispatch = useDispatch();
  const { isAbleToAddArtifact } = useStoreCheck();
  const [selectedArtifact, setSelectedArtifact] = useState<RawArtifact>();

  const handleSave = () => {
    const error = isAbleToAddArtifact(1);

    if (error) {
      notification.error({ content: error.message });
      return;
    }

    const { owner, ...artifactToSave } = artifact.serialize();

    dispatch(
      addDbArtifact({
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
      updateDbArtifact({
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

  const selectedIsSame = selectedArtifact && isExactArtifact(selectedArtifact, artifact);
  const hasNoSameArtifacts = !sameArtifacts.length;

  const caseConfigs = genCaseConfigs("Artifact", {
    hasNoSameEntities: hasNoSameArtifacts,
    withoutOwner: false,
  });

  return (
    <SaverLayout type="ARTIFACT" atfType={artifact.type}>
      <SavingStepLayout
        className="grow"
        actions={[
          {
            children: "Cancel",
            className: "mr-auto",
            onClick: onComplete,
          },
          {
            children: "Update",
            icon: <MdEdit />,
            hidden: hasNoSameArtifacts,
            disabled: !selectedArtifact || selectedIsSame,
            onClick: handleUpdate,
          },
          {
            children: "Add new",
            icon: <FaSave />,
            autoFocus: hasNoSameArtifacts,
            onClick: handleSave,
          },
        ]}
      >
        <div className="h-full flex flex-col justify-between">
          <div className="grow custom-scrollbar">
            <CaseNewArtifact {...caseConfigs.toSaveCase} artifact={artifact} />

            {sameArtifacts.length > 0 && (
              <CaseSameArtifacts
                {...caseConfigs.sameCase}
                data={artifact.data}
                withDivider
                sameArtifacts={sameArtifacts}
                selectedArtifact={selectedArtifact}
                onSelectArtifact={setSelectedArtifact}
              />
            )}
          </div>

          {selectedIsSame && (
            <div className="mt-4 text-sm">
              The selected artifact is already the same as the artifact to save.
            </div>
          )}
        </div>
      </SavingStepLayout>
    </SaverLayout>
  );
}
