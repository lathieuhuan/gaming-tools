import { useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Checkbox, ItemCase } from "rond";
import { AppArtifact, ARTIFACT_TYPES, GeneralCalc } from "@Backend";

import type { Artifact } from "@Src/types";
import { OptimizeResult } from "@Src/screens/Calculator/ContextProvider";
import { $AppArtifact } from "@Src/services";
import Entity_ from "@Src/utils/entity-utils";

// Component
import { GenshinImage, ItemThumbnail } from "@Src/components";

export interface ResultDisplayerProps {
  result: OptimizeResult;
  selectedArtifactId?: number;
  onSelectArtifact: (artifact: Artifact) => void;
  onToggleCheckCalculation: (index: number, checked: boolean) => void;
}
export function ResultDisplayer({
  result,
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

  return (
    <div className="pr-1 h-full custom-scrollbar space-y-2">
      {result.map((calculation, index) => {
        const setBonus = GeneralCalc.getArtifactSetBonuses(calculation.artifacts)
          .map((bonus) => `(${bonus.bonusLv * 2 + 2}) ${getSetData(bonus.code).name}`)
          .join(" + ");
        const expanded = expandIndexes.includes(index);

        return (
          <div key={index} className="p-4 rounded-md bg-surface-1">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-black text-danger-2">
                {index + 1}
                {suffixes[index]}
              </div>

              <Checkbox size="medium" defaultChecked onChange={(checked) => onToggleCheckCalculation(index, checked)} />
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
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

            <div className="mt-4">
              <button
                className={`max-w-full text-left flex gap-2 ${expanded ? "text-active-color" : "glow-on-hover"}`}
                title={setBonus}
                onClick={() => {
                  setExpandIndexes(
                    expanded
                      ? expandIndexes.filter((expandIndex) => expandIndex !== index)
                      : expandIndexes.concat(index)
                  );
                }}
              >
                <div className="h-6 flex items-center">
                  <FaInfoCircle className="text-lg shrink-0" />
                </div>
                <span>{setBonus}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
