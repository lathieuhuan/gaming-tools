import { useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { ButtonGroup, Checkbox, FancyBackSvg, ItemCase } from "rond";
import { ARTIFACT_TYPES, type AppArtifact } from "@Backend";

import type { Artifact } from "@Src/types";
import type { OptimizeResult } from "../../utils/optimizer-manager";

import { $AppArtifact } from "@Src/services";
import Entity_ from "@Src/utils/entity-utils";
import { ArtifactCard, GenshinImage, ItemThumbnail } from "@Src/components";

interface ResultDisplayProps {
  loading: boolean;
  result: OptimizeResult;
  onClickReturn: () => void;
  onClickExit: () => void;
  onClickLoadToCalculator: (selectedIndexes: number[]) => void;
}
export function ResultDisplay(props: ResultDisplayProps) {
  const [selected, setSelected] = useState<Artifact>();

  const selectedIndexes = useRef(new Set(props.result.map((_, i) => i)));
  const dataBySet = useRef<Record<number, AppArtifact>>({});
  const suffix = ["st", "nd", "rd"];

  const onToggleCheckCalculation = (index: number, checked: boolean) => {
    checked ? selectedIndexes.current.add(index) : selectedIndexes.current.delete(index);
  };

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow flex flex-col" style={{ minWidth: 324 }}>
        <div className="pr-1 grow custom-scrollbar space-y-2">
          {props.result.map((calculation, index) => {
            return (
              <div key={index} className="p-4 rounded-md bg-surface-1">
                <div className="flex justify-between items-start">
                  <p className="text-2xl font-black text-danger-2">
                    {index + 1}
                    {suffix[index]}
                  </p>

                  <Checkbox
                    size="medium"
                    defaultChecked
                    onChange={(checked) => onToggleCheckCalculation(index, checked)}
                  />
                </div>

                <div className="mt-2 flex gap-2">
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

        <ButtonGroup
          className="mt-4 px-2"
          justify="end"
          buttons={[
            {
              children: "Return",
              icon: <FancyBackSvg className="text-base" />,
              onClick: props.onClickReturn,
            },
            {
              children: "Exit",
              icon: <FaSignOutAlt className="text-base" />,
              onClick: props.onClickExit,
            },
            {
              children: "Load to Calculator",
              icon: <FaFileUpload className="text-base" />,
              className: "gap-1",
              onClick: () => props.onClickLoadToCalculator([...selectedIndexes.current]),
            },
          ]}
        />
      </div>

      <ArtifactCard wrapperCls="w-68 shrink-0" withOwnerLabel artifact={selected} />
    </div>
  );
}
