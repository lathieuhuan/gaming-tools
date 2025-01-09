import { useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Checkbox, CollapseSpace, ItemCase } from "rond";
import { AppArtifact, ARTIFACT_TYPES, ArtifactModifierDescription, ModInputConfig } from "@Backend";

import type { Artifact, ArtifactModCtrl } from "@Src/types";
import type { OptimizeResult } from "@OptimizeDept/OptimizeDept.types";
import type { ProcessedResult } from "./OptimizerOffice.types";

import { $AppArtifact } from "@Src/services";
import { getArtifactDescription } from "@Src/utils/description-parsers";
import Entity_ from "@Src/utils/entity-utils";
import Array_ from "@Src/utils/array-utils";

// Component
import { GenshinImage, GenshinModifierView, ItemThumbnail } from "@Src/components";

type Modifiers = Array<{ description: ArtifactModifierDescription; inputConfigs?: ModInputConfig[] }> | undefined;

export interface ResultDisplayerProps {
  result: OptimizeResult;
  processedResult: ProcessedResult;
  selectedArtifactId?: number;
  onSelectArtifact: (artifact: Artifact) => void;
  onToggleCheckCalculation: (index: number, checked: boolean) => void;
}
export function ResultDisplayer({
  result,
  processedResult,
  selectedArtifactId,
  onSelectArtifact,
  onToggleCheckCalculation,
}: ResultDisplayerProps) {
  //
  const [expandIndexes, setExpandIndexes] = useState<number[]>([]);
  const dataBySet = useRef<Record<number, AppArtifact>>({});
  const suffixes = ["st", "nd", "rd"];

  const getSetData = (code: number) => {
    let data = dataBySet.current[code];

    if (!data) {
      data = $AppArtifact.getSet(code)!;
      dataBySet.current[code] = data;
    }
    return data;
  };

  const renderModView = (type: "B" | "D") => (config: ArtifactModCtrl) => {
    if (config.activated) {
      const data = getSetData(config.code);
      const mods: Modifiers = type === "B" ? data.buffs : data.debuffs;
      const mod = Array_.findByIndex(mods, config.index);

      if (mod) {
        const description = getArtifactDescription(data, mod);

        return (
          <GenshinModifierView
            key={`${type}-${config.code}-${config.index}`}
            mutable={false}
            checked={config.activated}
            heading={data.name}
            description={description}
            inputs={config.inputs}
            inputConfigs={mod.inputConfigs}
          />
        );
      }
    }
    return null;
  };

  return (
    <div className="h-full custom-scrollbar space-y-2">
      {result.map((calculation, index) => {
        const processed = processedResult[index];
        const setBonusesSumary = processed.setBonuses
          .map((bonus) => `(${bonus.bonusLv * 2 + 2}) ${getSetData(bonus.code).name}`)
          .join(" + ");
        const hasAnyConfig =
          processed.artBuffCtrls.some((ctrl) => ctrl.activated) ||
          processed.artDebuffCtrls.some((ctrl) => ctrl.activated);
        const expanded = expandIndexes.includes(index);

        return (
          <div key={index} className="p-4 rounded-md bg-surface-1 space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-black text-danger-2">
                {index + 1}
                {suffixes[index]}
              </div>

              <Checkbox size="medium" defaultChecked onChange={(checked) => onToggleCheckCalculation(index, checked)} />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {calculation.artifacts.map((artifact, artifactI) => {
                if (artifact) {
                  const data = getSetData(artifact.code);

                  return (
                    <ItemCase
                      key={artifact.type}
                      chosen={artifact.ID === selectedArtifactId}
                      onClick={() => onSelectArtifact(artifact)}
                    >
                      {(className, imgCls) => (
                        <ItemThumbnail
                          compact
                          className={className}
                          imgCls={imgCls}
                          item={{ ...artifact, icon: data[artifact.type].icon }}
                        />
                      )}
                    </ItemCase>
                  );
                }
                return (
                  <div key={artifactI} className="p-1 bg-surface-2 rounded">
                    <GenshinImage
                      className="opacity-50"
                      src={Entity_.artifactIconOf(ARTIFACT_TYPES[artifactI])}
                      imgType="artifact"
                      fallbackCls="p-2"
                    />
                  </div>
                );
              })}
            </div>

            {hasAnyConfig ? (
              <div>
                <div>
                  <button
                    className={`max-w-full text-left flex gap-2 ${expanded ? "text-active-color" : "glow-on-hover"}`}
                    title={setBonusesSumary}
                    onClick={() => {
                      setExpandIndexes(
                        expanded
                          ? expandIndexes.filter((expandIndex) => expandIndex !== index)
                          : expandIndexes.concat(index)
                      );
                    }}
                  >
                    <span className="h-6 flex items-center">
                      <FaInfoCircle className="text-lg shrink-0" />
                    </span>
                    <span>{setBonusesSumary}</span>
                  </button>
                </div>

                <CollapseSpace active={expanded}>
                  <div className="pt-3">
                    <div className="h-px bg-surface-border/80" />

                    <div className="mt-2 space-y-2">
                      {processed.artBuffCtrls.map(renderModView("B"))}
                      {processed.artDebuffCtrls.map(renderModView("D"))}
                    </div>
                  </div>
                </CollapseSpace>
              </div>
            ) : (
              <div>{setBonusesSumary}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
