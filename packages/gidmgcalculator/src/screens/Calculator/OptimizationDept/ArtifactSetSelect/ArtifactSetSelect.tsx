import { useMemo, useRef, useState } from "react";
import { Button, Input } from "rond";

import { ArtifactManager } from "../hooks/useArtifactManager";
import { SetOption } from "./SetOption";

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
  manager: ArtifactManager;
  onRequestSelectPieces: (code: number) => void;
}
export function ArtifactSetSelect({ manager, onRequestSelectPieces }: ArtifactSetSelectProps) {
  const timeout = useRef<NodeJS.Timeout>();
  const [sets, setSets] = useState(manager.sets);
  const [keyword, setKeyword] = useState("");

  const [codes, setCodes] = useState({
    active: new Set<number>(),
    closing: new Set<number>(),
  });

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

  const onClickOption = (code: number, isActive: boolean) => {
    if (isActive) {
      setCodes((prevCodes) => ({
        ...prevCodes,
        closing: new Set(prevCodes.closing.add(code)),
      }));
    } else {
      setCodes(({ active }) => {
        const closing = new Set(active);
        return {
          active: new Set(active.add(code)),
          closing,
        };
      });
    }
  };

  const afterClosedActions = (code: number) => {
    setCodes((prevCodes) => {
      prevCodes.active.delete(code);
      return {
        ...prevCodes,
        active: new Set(prevCodes.active),
      };
    });
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
          const isActive = codes.active.has(data.code);

          return (
            <SetOption
              key={data.code}
              icon={data.icon}
              name={data.name}
              isActive={isActive}
              isClosing={codes.closing.has(data.code)}
              selectedCount={set.selectedIds.size}
              total={set.pieces.length}
              anyEquippedSelected={set.anyEquippedSelected}
              onClickLabel={() => onClickOption(data.code, isActive)}
              onClickSelectAll={() => setSets(manager.selectAll(data.code))}
              onClickUnselectAll={() => setSets(manager.unselectAll(data.code))}
              onClickRemoveEquipped={() => setSets(manager.removeEquipped(data.code))}
              onClickSelectPieces={() => onRequestSelectPieces(data.code)}
              afterClosedActions={() => afterClosedActions(data.code)}
            />
          );
        })}
      </div>
    </div>
  );
}
