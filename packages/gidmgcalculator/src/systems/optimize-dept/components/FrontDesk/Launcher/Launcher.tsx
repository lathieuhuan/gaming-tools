import { useMemo } from "react";
import { FaCalculator, FaListUl } from "react-icons/fa";
import { ButtonGroup } from "rond";

import type { ArtifactManager } from "@OptimizeDept/logic/ArtifactManager";

import { GenshinImage } from "@/components";
import { formatNumber } from "@/utils";
import Entity_ from "@/utils/entity-utils";
import { ARTIFACT_TYPES, ArtifactType } from "@Calculation";

type LauncherProps = {
  artifactManager: ArtifactManager;
  runCount: number;
  onLastResultRequested: () => void;
  onLaunch: () => void;
};

export function Launcher({ artifactManager, runCount, onLastResultRequested, onLaunch }: LauncherProps) {
  const topTypes: ArtifactType[] = ["flower", "plume"];
  const bottomTypes: ArtifactType[] = ["sands", "goblet", "circlet"];

  const count = useMemo(() => {
    const each = {} as Record<ArtifactType, number>;

    for (const type of ARTIFACT_TYPES) {
      each[type] = artifactManager.sumary[type].length;
    }
    return {
      ...each,
      all: each.flower + each.plume + each.sands + each.goblet + each.circlet,
      maxCalcs: artifactManager.calcCount,
    };
  }, []);

  const renderArtifactCount = (type: ArtifactType) => {
    return (
      <div key={type} className="px-2 py-1 rounded bg-surface-3 flex-center">
        <GenshinImage
          className="w-7 h-7 shrink-0"
          src={Entity_.artifactIconOf(type)}
          imgType="artifact"
          fallbackCls="p-1"
        />
        <span className="ml-1 text-lg font-medium">{count[type]}</span>
      </div>
    );
  };

  return (
    <div className="h-full pt-2 flex flex-col gap-4">
      <div>
        <p>
          • Total selected Artifacts: <span className="font-semibold text-lg text-primary-1">{count.all}</span>
        </p>

        <div className="mt-1 py-1 space-y-2">
          <div className="flex justify-center gap-2">{topTypes.map(renderArtifactCount)}</div>
          <div className="flex justify-center gap-2">{bottomTypes.map(renderArtifactCount)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <span>•</span>
        <div>
          <p>Maximum possible calculations:</p>
          <p className="font-bold text-lg text-primary-1">{formatNumber(count.maxCalcs.value)}</p>

          {count.maxCalcs.isExceededLimit ? (
            <p className="font-semibold text-danger-2 text-base">
              This exceeds the limit of {formatNumber(artifactManager.LIMIT_CALC_COUNT)} calculations. Please select
              less Artifacts.
            </p>
          ) : null}
        </div>
      </div>

      <div className="w-full h-px mx-auto bg-surface-border" />

      <ButtonGroup
        buttons={[
          {
            children: "Last Result",
            className: !runCount && "hidden",
            icon: <FaListUl className="text-base" />,
            onClick: onLastResultRequested,
          },
          {
            children: runCount ? "Recalculate" : "Calculate",
            variant: "primary",
            icon: <FaCalculator className="text-base" />,
            disabled: count.maxCalcs.isExceededLimit,
            onClick: onLaunch,
          },
        ]}
      />
    </div>
  );
}
