import { FaPlus, FaSave } from "react-icons/fa";
import { notification } from "rond";

import type { ArtifactSavingStep } from "./_types";

import { useDispatch } from "@Store/hooks";
import { addUserArtifact } from "@Store/userdb-slice";
import { genNewEntityMessage, genSimilarEntityMessage } from "../_config";

import { ArtifactCard } from "@/components/ArtifactCard";
import { SaverLayout } from "../_components/SaverLayout";
import { SavingStepLayout } from "../_components/SavingStepLayout";
import { ArtifactSaveMenu } from "./ArtifactSaveMenu";

type ArtifactSaverProps = Omit<ArtifactSavingStep, "type"> & {
  onComplete?: () => void;
};

export function ArtifactSaver({
  data: artifact,
  saveStatus,
  similarArtifacts = [],
  onComplete,
}: ArtifactSaverProps) {
  const dispatch = useDispatch();

  const getArtifactBasic = () => {
    const { owner, ...artifactToSave } = artifact.serialize();
    return artifactToSave;
  };

  const handleSave = () => {
    dispatch(addUserArtifact(getArtifactBasic()));

    notification.success({
      content: "Artifact saved successfully!",
    });
    onComplete?.();
  };

  const handleAddNew = () => {
    dispatch(
      addUserArtifact({
        ...getArtifactBasic(),
        ID: Date.now(),
      })
    );

    notification.success({
      content: "Artifact added successfully!",
    });
    onComplete?.();
  };

  switch (saveStatus) {
    case "NEW":
      return (
        <SaverLayout type="ARTIFACT">
          <SavingStepLayout
            className="grow"
            message={genNewEntityMessage("Artifact")}
            actions={[
              {
                children: "Add",
                autoFocus: true,
                icon: <FaSave />,
                onClick: handleSave,
              },
            ]}
            onContinue={onComplete}
          >
            <ArtifactCard wrapperCls="max-h-full custom-scrollbar" artifact={artifact} />
          </SavingStepLayout>
        </SaverLayout>
      );

    case "POSSIBLE_DUP":
      return (
        <SaverLayout type="ARTIFACT">
          <SavingStepLayout
            className="grow"
            message={genSimilarEntityMessage("Artifact")}
            actions={[
              {
                children: "Add new",
                icon: <FaPlus />,
                onClick: handleAddNew,
              },
            ]}
            onContinue={onComplete}
          >
            <ArtifactSaveMenu items={similarArtifacts} artifact={artifact} onUpdate={onComplete} />
          </SavingStepLayout>
        </SaverLayout>
      );
  }
}
