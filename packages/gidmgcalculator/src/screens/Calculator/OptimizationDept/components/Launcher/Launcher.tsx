import { useMemo, useRef, useState } from "react";
import { ARTIFACT_TYPES, ArtifactType } from "@Backend";
import type { ArtifactManager } from "../../utils/artifact-manager";

import { GenshinImage } from "@Src/components";
import { useOptimizerState } from "@Src/screens/Calculator/ContextProvider";
import { formatNumber } from "@Src/utils";
import Entity_ from "@Src/utils/entity-utils";

interface LauncherProps {
  manager: ArtifactManager;
}
export function Launcher({ manager }: LauncherProps) {
  const { status, optimizer } = useOptimizerState();
  const [percent, setPercent] = useState(0);
  const mounted = useRef(false);

  if (!mounted.current) {
    optimizer.onProcess = (value) => {
      setPercent(value);
    };
    mounted.current = true;
  }

  const count = useMemo(() => {
    const each = {} as Record<ArtifactType, number>;

    for (const type of ARTIFACT_TYPES) {
      each[type] = manager.sumary[type].length;
    }
    return {
      ...each,
      all: each.flower + each.plume + each.sands + each.goblet + each.circlet,
      maxCalcs: (each.flower || 1) * (each.plume || 1) * (each.sands || 1) * (each.goblet || 1) * (each.circlet || 1),
    };
  }, []);

  const row = {
    top: ["flower", "plume"] satisfies ArtifactType[],
    bottom: ["sands", "goblet", "circlet"] satisfies ArtifactType[],
  };

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
    <div className="pt-2 space-y-4">
      <div>
        <p className="text-lg">
          • Total selected Artifacts: <span className="font-semibold text-primary-1">{count.all}</span>
        </p>

        <div className="mt-1 py-1 space-y-2">
          <div className="flex justify-center gap-2">{row.top.map(renderArtifactCount)}</div>
          <div className="flex justify-center gap-2">{row.bottom.map(renderArtifactCount)}</div>
        </div>
      </div>

      <div className="text-lg flex gap-2">
        <span>•</span>
        <div>
          <p>Maximum possible calculations:</p>
          <p className="font-bold text-primary-1">{formatNumber(count.maxCalcs)}</p>
        </div>
      </div>

      <div className="w-full h-px mx-auto bg-surface-border" />

      {status.loading && (
        <div>
          <p className="text-lg text-center font-medium">Calculating...</p>

          <div className="px-3">
            <div className="w-full h-3 mt-2 bg-surface-3 rounded-md overflow-hidden">
              <div className="h-full bg-active-color transition-size duration-150" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
