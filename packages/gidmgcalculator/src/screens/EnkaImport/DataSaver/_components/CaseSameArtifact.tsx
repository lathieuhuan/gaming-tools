import type { AppArtifact, IArtifactBasic } from "@/types";

import { createArtifact } from "@/utils/entity.utils";

import { ArtifactSummary } from "./ArtifactSummary";
import { SavingCase, SavingCaseProps } from "./SavingCase";

type CaseSameArtifactsProps = Pick<SavingCaseProps, "message" | "hint" | "withDivider"> & {
  sameArtifacts: IArtifactBasic[];
  selectedArtifact?: IArtifactBasic;
  data: AppArtifact;
  onSelectArtifact?: (artifact: IArtifactBasic) => void;
};

export function CaseSameArtifacts({
  sameArtifacts,
  selectedArtifact,
  data,
  onSelectArtifact,
  ...caseProps
}: CaseSameArtifactsProps) {
  return (
    <SavingCase {...caseProps}>
      <div className="space-y-2">
        {sameArtifacts.map((item, index) => (
          <ArtifactSummary
            key={item.ID}
            label={
              <span>
                <span>Artifact {index + 1}</span>{" "}
                {item.owner && <span className="text-light-4">({item.owner})</span>}
              </span>
            }
            artifact={createArtifact(item, data)}
            selectable
            selected={selectedArtifact?.ID === item.ID}
            onSelect={() => onSelectArtifact?.(item)}
          />
        ))}
      </div>
    </SavingCase>
  );
}
