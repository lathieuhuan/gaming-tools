import { useMemo, useRef, useState } from "react";
import { Button, Input } from "rond";

import { ArtifactManager } from "../hooks/useArtifactManager";
import { SetOption, SetOptionActions } from "./SetOption";

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
  const timeout = useRef<NodeJS.Timeout>();
  const [sets, setSets] = useState(manager.sets);
  const [expandedCode, setExpandedCode] = useState(-1);
  const [keyword, setKeyword] = useState("");
  const [detailCode, setDetailCode] = useState(0);

  const all = useMemo(() => {
    const visibleCodes = new Set<number>();
    let visibleSelectedCount = 0;
    let anyEquippedSelected = false;

    for (const set of sets) {
      if (!keyword || set.data.name.toLowerCase().includes(keyword)) {
        visibleCodes.add(set.data.code);
        visibleSelectedCount += set.selectedIds.size;

        if (set.anyEquippedSelected) {
          anyEquippedSelected = true;
        }
      }
    }

    return {
      visibleCodes,
      visibleSelectedCount,
      anyEquippedSelected,
    };
  }, [sets, keyword]);

  const onChangeKeyword = (kw: string) => {
    clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setKeyword(kw.toLowerCase());
    }, 200);
  };

  return (
    <div className="space-y-3">
      <div>
        <Input className="w-full" placeholder="Search" onChange={onChangeKeyword} />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          size="small"
          disabled={!all.visibleSelectedCount}
          onClick={() => setSets(manager.unselectAll(all.visibleCodes))}
        >
          Unselect All{all.visibleSelectedCount ? ` (${all.visibleSelectedCount})` : ""}
        </Button>
        <Button
          size="small"
          disabled={!all.anyEquippedSelected}
          onClick={() => setSets(manager.removeEquipped(all.visibleCodes))}
        >
          Remove Equipped
        </Button>
      </div>

      <div className="space-y-2">
        {sets.map((set) => {
          const { data } = set;

          if (!all.visibleCodes.has(data.code)) {
            return null;
          }
          const total = set.pieces.length;
          const selectedCount = set.selectedIds.size;
          const isExpanded = data.code === expandedCode;

          return (
            <SetOption
              key={data.code}
              icon={data.icon}
              name={data.name}
              isExpanded={isExpanded}
              selectedCount={selectedCount}
              total={total}
              onClickExpand={() => setExpandedCode(isExpanded ? -1 : data.code)}
            >
              {isExpanded && (
                <SetOptionActions
                  selectAll={{
                    disabled: selectedCount === total,
                    onClick: () => setSets(manager.selectAll(data.code)),
                  }}
                  unselectAll={{
                    disabled: !selectedCount,
                    onClick: () => setSets(manager.unselectAll(data.code)),
                  }}
                  removeEquipped={{
                    disabled: !set.anyEquippedSelected,
                    onClick: () => setSets(manager.removeEquipped(data.code)),
                  }}
                  selectIndividual={{
                    onClick: () => setDetailCode(data.code),
                  }}
                />
              )}
            </SetOption>
          );
        })}
      </div>
    </div>
  );
}
