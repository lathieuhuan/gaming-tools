import { AppArtifact, ARTIFACT_TYPES } from "@Calculation";
import { FaInfoCircle } from "react-icons/fa";
import { CollapseSpace, ItemCase } from "rond";

import type { Artifact } from "@Src/types";
import type { ProcessedResult } from "./InternalOffice.types";

import Entity_ from "@Src/utils/entity-utils";
import { GenshinImage, ItemThumbnail } from "@Src/components";

export interface ResultItemDisplayerProps {
  title: string;
  expanded: boolean;
  selectedArtifactId?: number;
  item: ProcessedResult[number];
  mutedItemCase?: boolean;
  keepCheckbox: React.ReactNode;
  modSection: React.ReactNode;
  getSetData: (code: number) => AppArtifact;
  onClickExpand: (expanded: boolean) => void;
  onSelectArtifact: (artifact: Artifact) => void;
}
export function ResultItemDisplayer({
  title,
  expanded,
  selectedArtifactId,
  item,
  mutedItemCase,
  keepCheckbox,
  modSection,
  getSetData,
  onClickExpand,
  onSelectArtifact,
}: ResultItemDisplayerProps) {
  const setBonusesSumary = item.setBonuses
    .map((bonus) => `(${bonus.bonusLv * 2 + 2}) ${getSetData(bonus.code).name}`)
    .join(" + ");
  const hasAnyConfig =
    item.artBuffCtrls.some((ctrl) => ctrl.activated) || item.artDebuffCtrls.some((ctrl) => ctrl.activated);

  return (
    <div className="p-4 rounded-md bg-surface-1 space-y-4">
      <div className="flex justify-between items-start">
        <div className="text-2xl font-black text-secondary-1">{title}</div>
        {keepCheckbox}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {item.artifacts.map((artifact, artifactI) => {
          if (artifact) {
            const data = getSetData(artifact.code);

            return (
              <ItemCase
                key={artifact.type}
                chosen={artifact.ID === selectedArtifactId}
                muted={mutedItemCase}
                onClick={() => !mutedItemCase && onSelectArtifact(artifact)}
              >
                {(className, imgCls) => (
                  <ItemThumbnail
                    className={className}
                    imgCls={imgCls}
                    compact
                    title={data.name}
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
              onClick={() => onClickExpand(expanded)}
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
              <div className="mt-2 space-y-2">{modSection}</div>
            </div>
          </CollapseSpace>
        </div>
      ) : (
        <div>{setBonusesSumary}</div>
      )}
    </div>
  );
}
