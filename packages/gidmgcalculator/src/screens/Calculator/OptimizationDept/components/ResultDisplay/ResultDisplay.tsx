import { useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { ButtonGroup, Checkbox, FancyBackSvg, ItemCase } from "rond";
import { ARTIFACT_TYPES, OptimizerAllArtifactModConfigs, AppArtifact } from "@Backend";

import type { Artifact, CalcSetup } from "@Src/types";

import { useOptimizerState } from "@Src/screens/Calculator/ContextProvider";
import { $AppArtifact } from "@Src/services";
import Entity_ from "@Src/utils/entity-utils";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";
import { importSetup } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";

// Component
import { ArtifactCard, GenshinImage, ItemThumbnail } from "@Src/components";

interface ResultDisplayProps {
  setup: CalcSetup;
  artifactModConfigs: OptimizerAllArtifactModConfigs;
  onRequestReturn: () => void;
  onRequestExit: () => void;
}
export function ResultDisplay(props: ResultDisplayProps) {
  const dispatch = useDispatch();

  const [selected, setSelected] = useState<Artifact>();
  const {
    status: { result },
  } = useOptimizerState();

  const selectedIndexes = useRef(new Set(result.map((_, i) => i)));
  const dataBySet = useRef<Record<number, AppArtifact>>({});
  const suffixes = ["st", "nd", "rd"];

  const onToggleCheckCalculation = (index: number, checked: boolean) => {
    checked ? selectedIndexes.current.add(index) : selectedIndexes.current.delete(index);
  };

  const loadResultToCalculator = () => {
    const { buffs, debuffs } = props.artifactModConfigs;
    let id = Date.now();

    for (const index of selectedIndexes.current) {
      const { artifacts = [] } = result.at(index) || {};
      const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts)
        .map((control) => buffs[control.code])
        .flat();
      const calcSetup = Object_.clone(props.setup);

      calcSetup.artifacts = artifacts;
      calcSetup.artBuffCtrls = artBuffCtrls;

      dispatch(
        importSetup({
          importInfo: {
            ID: id++,
            type: "original",
            name: `Optimized ${index + 1}${suffixes[index]}`,
            calcSetup,
          },
        })
      );
    }

    props.onRequestExit();
  };

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow flex flex-col" style={{ minWidth: 324 }}>
        <div className="pr-1 grow custom-scrollbar space-y-2">
          {result.map((calculation, index) => {
            return (
              <div key={index} className="p-4 rounded-md bg-surface-1">
                <div className="flex justify-between items-start">
                  <p className="text-2xl font-black text-danger-2">
                    {index + 1}
                    {suffixes[index]}
                  </p>

                  <Checkbox
                    size="medium"
                    defaultChecked
                    onChange={(checked) => onToggleCheckCalculation(index, checked)}
                  />
                </div>

                <div className="mt-2 grid grid-cols-5 gap-2">
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
              </div>
            );
          })}
        </div>

        <ButtonGroup
          className="mt-4 px-2 pb-1"
          justify="end"
          buttons={[
            {
              children: "Return",
              icon: <FancyBackSvg />,
              onClick: props.onRequestReturn,
            },
            {
              children: "Exit",
              icon: <FaSignOutAlt className="text-base" />,
              onClick: props.onRequestExit,
            },
            {
              children: "Load to Calculator",
              icon: <FaFileUpload className="text-base" />,
              className: "gap-1",
              onClick: loadResultToCalculator,
            },
          ]}
        />
      </div>

      <ArtifactCard wrapperCls="w-68 shrink-0" withOwnerLabel artifact={selected} />
    </div>
  );
}
