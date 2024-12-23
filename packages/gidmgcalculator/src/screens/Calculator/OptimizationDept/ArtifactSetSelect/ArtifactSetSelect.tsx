import { useState } from "react";
import { FaCog } from "react-icons/fa";
import { Button } from "rond";

import { GenshinImage } from "@Src/components";
import { ArtifactManager } from "../hooks/useArtifactManager";

export type ArtifactSetOption = {
  data: {
    code: number;
    name: string;
    icon: string;
  };
  totalCount: number;
  selectedCount: number;
};

interface ArtifactSetSelectProps {
  id: string;
  manager: ArtifactManager;
  onSubmit: (sets: ArtifactSetOption[]) => string | undefined;
}
export function ArtifactSetSelect({ manager }: ArtifactSetSelectProps) {
  const [sets, setSets] = useState(manager.sets);
  const [expandedCode, setExpandedCode] = useState(0);

  return (
    <div>
      <div className="space-y-2">
        {sets.map((set) => {
          const { data } = set;
          const total = set.pieces.length;
          const selectedCount = set.selectedIds.size;
          const isExpanded = data.code === expandedCode;

          return (
            <div key={data.code}>
              <div className="py-1 bg-surface-1 rounded-sm flex items-center">
                <div className="px-2 flex items-center gap-2">
                  <GenshinImage className="w-7 h-7" src={data.icon} imgType="artifact" />
                  <span>{data.name}</span>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  <p>
                    {selectedCount ? <span>{selectedCount} / </span> : null}
                    <span>{total}</span>
                  </p>
                  <Button
                    title="Settings"
                    icon={<FaCog />}
                    variant="custom"
                    className={isExpanded ? "text-active-color" : ""}
                    onClick={() => setExpandedCode(isExpanded ? 0 : data.code)}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 bg-surface-3 rounded-b-sm flex flex-wrap gap-3">
                  <Button
                    size="small"
                    disabled={selectedCount === total}
                    onClick={() => setSets(manager.selectAll(data.code))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    disabled={!selectedCount}
                    onClick={() => setSets(manager.unselectAll(data.code))}
                  >
                    Unselect All
                  </Button>
                  <Button
                    size="small"
                    disabled={!set.anyEquippedSelected}
                    onClick={() => setSets(manager.removeEquipped(data.code))}
                  >
                    Remove Equipped
                  </Button>
                </div>
              )}
              {/* <div></div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
