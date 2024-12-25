import { useRef, useState } from "react";
import { clsx, ItemCase, LoadingSpin } from "rond";
import { ARTIFACT_TYPES, type AppArtifact } from "@Backend";
import type { Artifact } from "@Src/types";
import type { OptimizeResult } from "../../utils/optimizer-manager";

import { ArtifactCard, GenshinImage, ItemThumbnail } from "@Src/components";
import { $AppArtifact } from "@Src/services";
import Entity_ from "@Src/utils/entity-utils";

interface ResultDisplayProps {
  loading: boolean;
  result: OptimizeResult;
}
export function ResultDisplay(props: ResultDisplayProps) {
  const [selected, setSelected] = useState<Artifact>();
  const dataBySet = useRef<Record<number, AppArtifact>>({});

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow">
        {props.result.map((calculation, index) => {
          return (
            <div key={index} className="p-4 rounded">
              {/* <p className={clsx("text-xl font-semibold", index ? "text-secondary-1" : "text-primary-1")}>
                {Math.round(calculation.damage)}
              </p> */}
              <div className="flex gap-2">
                {calculation.artifacts.map((artifact, artifactI) => {
                  if (artifact) {
                    let data = dataBySet.current[artifact.code];

                    if (!data) {
                      data = $AppArtifact.getSet(artifact.code)!;
                      dataBySet.current[artifact.code] = data;
                    }
                    return (
                      <ItemCase
                        key={artifact.type}
                        className="w-full"
                        chosen={artifact.ID === selected?.ID}
                        onClick={() => setSelected(artifact)}
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
                    <GenshinImage
                      key={artifactI}
                      className="w-full"
                      src={Entity_.artifactIconOf(ARTIFACT_TYPES[artifactI])}
                      imgType="artifact"
                      fallbackCls="p-2"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ArtifactCard wrapperCls="w-72 shrink-0" withOwnerLabel artifact={selected} />
    </div>
  );
}
