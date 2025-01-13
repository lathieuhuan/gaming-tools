import { ArtifactModifierDescription, ModInputConfig } from "@Backend";
import { useEffect, useRef, useState } from "react";
import { ButtonGroup, Checkbox } from "rond";

import type { Artifact, ArtifactModCtrl } from "@Src/types";
import type { ProcessedResult, ProcessedSetup } from "./InternalOffice.types";

import { useArtifactSetData } from "@Src/hooks";
import Array_ from "@Src/utils/array-utils";
import { getArtifactDescription } from "@Src/utils/description-parsers";

// Component
import { ArtifactCard, GenshinModifierView } from "@Src/components";
import { ResultItemDisplayer, type ResultItemDisplayerProps } from "./ResultItemDisplayer";

type Modifiers = Array<{ description: ArtifactModifierDescription; inputConfigs?: ModInputConfig[] }> | undefined;

export interface ResultDisplayerProps {
  processedResult: ProcessedResult;
  selectingResult: boolean;
  setups: ProcessedSetup[];
  maxSelected: number;
  onRequestLoad: (setups: ProcessedSetup[]) => void;
  onCancelSelecting: () => void;
}
export function ResultDisplayer({
  processedResult,
  selectingResult,
  setups,
  maxSelected,
  onCancelSelecting,
  onRequestLoad,
}: ResultDisplayerProps) {
  const defaultSelectedSetups = processedResult.map((item) => item.manageInfo);

  const [selectedArtifact, setSelectedArtifact] = useState<Artifact>();
  const [expandIndexes, setExpandIndexes] = useState<number[]>([]);
  const [selectedSetups, setSelectedSetups] = useState<ProcessedSetup[]>(defaultSelectedSetups);

  const setData = useArtifactSetData();
  const bodyRef = useRef<HTMLDivElement>(null);

  const suffixes = ["st", "nd", "rd"];

  useEffect(() => {
    if (selectingResult && bodyRef.current) {
      bodyRef.current.scrollLeft = 999;
    }
  }, [selectingResult]);

  const renderModView = (type: "B" | "D") => (config: ArtifactModCtrl) => {
    if (config.activated) {
      const data = setData.get(config.code);
      const mods: Modifiers = type === "B" ? data.buffs : data.debuffs;
      const mod = Array_.findByIndex(mods, config.index);

      if (mod) {
        return (
          <GenshinModifierView
            key={`${type}-${config.code}-${config.index}`}
            mutable={false}
            checked={config.activated}
            heading={data.name}
            description={getArtifactDescription(data, mod)}
            inputs={config.inputs}
            inputConfigs={mod.inputConfigs}
          />
        );
      }
    }
    return null;
  };

  const onSelectArtifact: ResultItemDisplayerProps["onSelectArtifact"] = (artifact) => {
    setSelectedArtifact(artifact);
    if (bodyRef.current) bodyRef.current.scrollLeft = 999;
  };

  const onSelectSetup = (setup: ProcessedSetup) => (checked: boolean) => {
    setSelectedSetups((prevSelected) =>
      checked ? prevSelected.concat(setup) : prevSelected.filter((selectedSetup) => selectedSetup.ID !== setup.ID)
    );
  };

  return (
    <div ref={bodyRef} className="grow flex gap-2 hide-scrollbar scroll-smooth">
      <div className="grow custom-scrollbar" style={{ minWidth: 360 }}>
        <div className="h-full custom-scrollbar space-y-2">
          {processedResult.map((processedItem, index) => {
            return (
              <ResultItemDisplayer
                key={index}
                item={processedItem}
                title={`${index + 1}${suffixes[index]}`}
                expanded={expandIndexes.includes(index)}
                selectedArtifactId={selectedArtifact?.ID}
                mutedItemCase={selectingResult}
                keepCheckbox={
                  selectingResult ? (
                    <Checkbox defaultChecked onChange={onSelectSetup(processedItem.manageInfo)}>
                      Keep
                    </Checkbox>
                  ) : null
                }
                modSection={
                  <div className="mt-2 space-y-2">
                    {processedItem.artBuffCtrls.map(renderModView("B"))}
                    {processedItem.artDebuffCtrls.map(renderModView("D"))}
                  </div>
                }
                getSetData={setData.get}
                onClickExpand={(expanded) => {
                  setExpandIndexes(
                    expanded
                      ? expandIndexes.filter((expandIndex) => expandIndex !== index)
                      : expandIndexes.concat(index)
                  );
                }}
                onSelectArtifact={onSelectArtifact}
              />
            );
          })}
        </div>
      </div>

      <div className="w-68 shrink-0">
        {selectingResult ? (
          <div className="px-2 py-4 bg-surface-1 rounded">
            <div className="px-2">
              <p>
                The number of Setups after load cannot exceed <span className="font-semibold text-danger-2">5</span>.
              </p>
              <p className="mt-1 text-sm text-hint-color">
                Please select the result and the current setups you want to keep.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {setups.map((setup) => {
                return (
                  <div key={setup.ID}>
                    <Checkbox className="p-2 rounded hover:bg-surface-3" onChange={onSelectSetup(setup)}>
                      {setup.name}
                    </Checkbox>
                  </div>
                );
              })}
            </div>

            <ButtonGroup
              className="mt-6"
              buttons={[
                {
                  children: "Cancel",
                  onClick: () => {
                    setSelectedSetups(defaultSelectedSetups);
                    onCancelSelecting();
                  },
                },
                {
                  children: `Load (${selectedSetups.length})`,
                  variant: "primary",
                  disabled:
                    selectedSetups.length > maxSelected ||
                    !selectedSetups.filter((setup) => setup.type === "optimized").length,
                  onClick: () => onRequestLoad(selectedSetups),
                },
              ]}
            />
          </div>
        ) : (
          <ArtifactCard style={{ height: "28rem" }} withOwnerLabel artifact={selectedArtifact} />
        )}
      </div>
    </div>
  );
}
