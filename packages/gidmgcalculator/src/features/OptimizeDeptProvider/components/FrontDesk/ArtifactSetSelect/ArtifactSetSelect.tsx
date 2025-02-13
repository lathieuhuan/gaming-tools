import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, OverflowTrackingContainer, useIntersectionObserver } from "rond";

import type { ArtifactManager } from "@OptimizeDept/hooks/useArtifactManager";
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
  artifactManager: ArtifactManager;
  onChangeValid: (valid: boolean) => void;
  onRequestSelectPieces: (code: number) => void;
}
export function ArtifactSetSelect({ artifactManager, onChangeValid, onRequestSelectPieces }: ArtifactSetSelectProps) {
  const timeout = useRef<NodeJS.Timeout>();
  const [sets, setSets] = useState(artifactManager.sets);
  const [keyword, setKeyword] = useState("");

  const [codes, setCodes] = useState({
    active: new Set<number>(),
    closing: new Set<number>(),
  });

  const { observedAreaRef, itemUtils, visibleMap } = useIntersectionObserver();
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => {
    const visibleCodes = new Set<number>();
    let visibleSelectedCount = 0;
    let anyEquippedSelected = false;

    for (const set of sets) {
      if (!keyword || set.data.name.toLowerCase().includes(keyword)) {
        visibleCodes.add(set.data.code);
        visibleSelectedCount += set.selectedIds.size;

        if (!anyEquippedSelected && artifactManager.checkAnyEquippedSelected(set)) {
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

  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      if (e.key.length === 1 && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    document.body.addEventListener("keydown", focus);

    return () => {
      document.body.removeEventListener("keydown", focus);
    };
  }, []);

  useEffect(() => {
    onChangeValid(sets.some((set) => set.selectedIds.size));
  }, [sets]);

  const onChangeKeyword = (kw: string) => {
    clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      setKeyword(kw.toLowerCase());
    }, 150);
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
      const newActive = new Set(prevCodes.active);
      newActive.delete(code);

      return {
        ...prevCodes,
        active: newActive,
      };
    });
  };

  return (
    <div ref={observedAreaRef} className="h-full flex flex-col gap-3">
      <div>
        <Input ref={inputRef} className="w-full" placeholder="Search" onChange={onChangeKeyword} />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          size="small"
          disabled={!all.visibleSelectedCount}
          onClick={() => setSets(artifactManager.unselectAll(all.visibleCodes))}
        >
          Unselect All{all.visibleSelectedCount ? ` (${all.visibleSelectedCount})` : ""}
        </Button>
        <Button
          size="small"
          disabled={!all.anyEquippedSelected}
          onClick={() => setSets(artifactManager.removeEquipped(all.visibleCodes))}
        >
          Remove Equipped
        </Button>
      </div>

      <OverflowTrackingContainer className="custom-scrollbar grow" wrapCls="space-y-2" overflowedCls="pr-3">
        {all.visibleCodes.size ? (
          sets.map((set) => {
            const { code } = set.data;

            if (!all.visibleCodes.has(code)) {
              return null;
            }
            const isActive = codes.active.has(code);

            return (
              <div key={code} {...itemUtils.getProps(code)}>
                <SetOption
                  isActive={isActive}
                  isVisible={visibleMap[code]}
                  isClosing={codes.closing.has(code)}
                  set={set}
                  manager={artifactManager}
                  onClickLabel={() => onClickOption(code, isActive)}
                  onClickSelectPieces={() => onRequestSelectPieces(code)}
                  onChangeSets={setSets}
                  afterClosedActions={() => afterClosedActions(code)}
                />
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-hint-color">No Artifact set found</div>
        )}
      </OverflowTrackingContainer>
    </div>
  );
}
