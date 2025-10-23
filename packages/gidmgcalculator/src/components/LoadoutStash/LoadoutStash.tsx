import { useState } from "react";
import { Button, EntitySelectTemplate, Modal, SwitchNode } from "rond";

import type { CalcArtifact, UserArtifact } from "@/types";
import Entity_ from "@/utils/Entity";

// Component
import { ArtifactCard } from "@/components/ArtifactCard";
import { EquippedSetStash } from "./EquippedSetStash";

type LoadoutType = "EQUIPPED" | "CUSTOM";

const LOADOUT_TYPE_OPTIONS: Array<{ label: string; value: LoadoutType }> = [
  { label: "Equipped Set", value: "EQUIPPED" },
];

type LoadoutStashCoreProps = {
  onSelect?: (set: CalcArtifact[]) => void;
  onClose: () => void;
};

export function LoadoutStashCore({ onSelect, onClose }: LoadoutStashCoreProps) {
  const [selectedType, setSelectedType] = useState<LoadoutType>("EQUIPPED");
  const [selectedArtifact, setSelectedArtifact] = useState<UserArtifact>();

  const handleTypeSelect = (type: LoadoutType) => {
    if (type !== selectedType) {
      setSelectedType(type);
    }
  };

  const handleEquippedSetSelect = (artifacts: UserArtifact[]) => {
    onSelect?.(artifacts.map(Entity_.userItemToCalcItem));
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
                        onSelectedArtifactChange={setSelectedArtifact}
                        onSetSelect={handleEquippedSetSelect}
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
