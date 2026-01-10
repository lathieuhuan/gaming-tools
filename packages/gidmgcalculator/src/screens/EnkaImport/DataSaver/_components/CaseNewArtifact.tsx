import type { Artifact } from "@/models/base";

import { SavingCase, SavingCaseProps } from "./SavingCase";
import { ArtifactSummary } from "./ArtifactSummary";

type CaseNewArtifactProps = Pick<SavingCaseProps, "message" | "hint" | "withDivider"> & {
  artifact: Artifact;
};

export function CaseNewArtifact({ artifact, ...props }: CaseNewArtifactProps) {
  return (
    <SavingCase {...props}>
      <ArtifactSummary variant="primary" label={artifact.data.name} artifact={artifact} />
    </SavingCase>
  );
}
