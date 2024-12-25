import { useMemo } from "react";
import { ARTIFACT_TYPES, ArtifactType } from "@Backend";

import { GenshinImage } from "@Src/components";
import Entity_ from "@Src/utils/entity-utils";
import { ArtifactManager } from "../../utils/artifact-manager";

interface ReviewProps {
  manager: ArtifactManager;
}
export function Review({ manager }: ReviewProps) {
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

  return (
    <div className="pt-2 space-y-4">
      <div>
        <p className="text-lg">
          Total selected Artifacts: <span className="font-semibold text-primary-1">{count.all}</span>
        </p>

        <div className="mt-2 px-3 flex justify-between">
          {ARTIFACT_TYPES.map((type) => {
            return (
              <div key={type} className="flex items-center gap-2">
                <GenshinImage className="w-7 h-7 font-semibold" src={Entity_.artifactIconOf(type)} imgType="artifact" />
                <span className="text-lg">{count[type]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-lg">
          Maximum possible calculations: <span className="font-semibold text-primary-1">{count.maxCalcs}</span>
        </p>
      </div>
    </div>
  );
}
