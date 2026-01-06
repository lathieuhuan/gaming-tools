import { useState } from "react";

import type { Artifact } from "@/models/base";
import type { IArtifactBasic } from "@/types";

import { createArtifact } from "@/utils/entity";

import { ArtifactSummary, ArtifactSummaryContent } from "./ArtifactSummary";
import { ItemSaveOption } from "./ItemSaveOption";

type ArtifactCompareMenuProps = {
  className?: string;
  artifact: Artifact;
  sameArtifacts: IArtifactBasic[];
  onSelect?: (artifact: IArtifactBasic) => void;
};

export function ArtifactCompareMenu({
  className,
  artifact,
  sameArtifacts,
  onSelect,
}: ArtifactCompareMenuProps) {
  const [selectedId, setSelectedId] = useState<number>();

  const handleSelect = (artifact: IArtifactBasic) => {
    setSelectedId(artifact.ID);
    onSelect?.(artifact);
  };

  return (
    <div className={className}>
      <ArtifactSummary className="mb-2" label={artifact.data.name} artifact={artifact} />

      <div className="space-y-2">
        {sameArtifacts.map((item, index) => {
          return (
            <ItemSaveOption
              key={item.ID}
              label={`Artifact ${index + 1}`}
              item={item}
              selected={selectedId === item.ID}
              onSelect={() => handleSelect(item)}
            >
              <ArtifactSummaryContent artifact={createArtifact(item, artifact.data)} />
            </ItemSaveOption>
          );
        })}
      </div>
    </div>
  );
}
