import { useState } from "react";
import { Button, EntitySelectTemplate, Modal, SwitchNode } from "rond";

import { Artifact } from "@/models/base";

// Component
import { ArtifactCard } from "@/components/ArtifactCard";
import { ArtifactOption, EquippedSetStash, EquippedSetStashProps } from "./EquippedSetStash";

type LoadoutType = "EQUIPPED" | "CUSTOM";

const LOADOUT_TYPE_OPTIONS: Array<{ label: string; value: LoadoutType }> = [
  { label: "Equipped Set", value: "EQUIPPED" },
];

export type LoadoutStashProps = {
  onSelect?: EquippedSetStashProps["onSelectSet"];
  onClose: () => void;
};

export function LoadoutStashCore({ onSelect, onClose }: LoadoutStashProps) {
  const [selectedType, setSelectedType] = useState<LoadoutType>("EQUIPPED");
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact>();

  const handleTypeSelect = (type: LoadoutType) => {
    if (type !== selectedType) {
      setSelectedType(type);
    }
  };

  const handleSelectArtifact = (artifact?: ArtifactOption) => {
    setSelectedArtifact(artifact && new Artifact(artifact.userData, artifact.data));
  };

  const handleSelectSet = (artifacts: ArtifactOption[]) => {
    onSelect?.(artifacts);
  };

  return (
    <EntitySelectTemplate title="Artifact Loadouts" hasSearch onClose={onClose}>
      {({ keyword }) => (
        <div className="h-full flex flex-col overflow-hidden bg-dark-2">
          <div className="flex space-x-4">
            {LOADOUT_TYPE_OPTIONS.map((option) => {
              return (
                <Button
                  key={option.value}
                  variant={option.value === selectedType ? "active" : "default"}
                  size="small"
                  onClick={() => handleTypeSelect(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="pt-3 grow flex space-x-2 hide-scrollbar">
            <div
              className="grow hide-scrollbar"
              style={{
                minWidth: "18rem",
              }}
            >
              <SwitchNode
                value={selectedType}
                cases={[
                  {
                    value: "EQUIPPED",
                    element: (
                      <EquippedSetStash
                        keyword={keyword}
                        onSelectArtifact={handleSelectArtifact}
                        onSelectSet={handleSelectSet}
                      />
                    ),
                  },
                ]}
              />
            </div>

            <ArtifactCard className="w-68 shrink-0" artifact={selectedArtifact} />
          </div>
        </div>
      )}
    </EntitySelectTemplate>
  );
}

export const LoadoutStash = Modal.coreWrap(LoadoutStashCore, { preset: "large" });
