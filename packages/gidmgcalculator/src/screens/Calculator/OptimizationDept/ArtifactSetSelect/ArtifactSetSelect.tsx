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

        if (!anyEquippedSelected && manager.checkAnyEquippedSelected(set)) {
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
        closing: new Set(prevCodes.closing).add(code),
      }));
    } else {
      setCodes(({ active }) => ({
        active: new Set(active).add(code),
        closing: new Set(active),
      }));
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
          const { code } = set.data;

          if (!all.visibleCodes.has(code)) {
            return null;
          }
          const isActive = codes.active.has(code);

          return (
            <SetOption
              key={code}
              isActive={isActive}
              isClosing={codes.closing.has(code)}
              set={set}
              manager={manager}
              onClickLabel={() => onClickOption(code, isActive)}
              onClickSelectPieces={() => onRequestSelectPieces(code)}
              onChangeSets={setSets}
              afterClosedActions={() => afterClosedActions(code)}
            />
          );
        })}
      </div>
    </div>
  );
}
