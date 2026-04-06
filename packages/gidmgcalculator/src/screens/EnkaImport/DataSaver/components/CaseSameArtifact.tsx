import type { AppArtifact, RawArtifact } from "@/types";

import { createArtifact } from "@/logic/entity.logic";

import { ArtifactSummary } from "./ArtifactSummary";
import { SavingCase, SavingCaseProps } from "./SavingCase";

type CaseSameArtifactsProps = Pick<SavingCaseProps, "message" | "hint" | "withDivider"> & {
  sameArtifacts: RawArtifact[];
  selectedArtifact?: RawArtifact;
  data: AppArtifact;
  onSelectArtifact?: (artifact: RawArtifact) => void;
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
