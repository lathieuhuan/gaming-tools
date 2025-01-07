import { useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { Button, ButtonProps, Checkbox, ItemCase, Modal, Popover, TimesSvg, useClickOutside } from "rond";
import { ARTIFACT_TYPES, AppArtifact, GeneralCalc } from "@Backend";

import type { Artifact } from "@Src/types";

import { useOptimizerState } from "@Src/screens/Calculator/ContextProvider";
import { $AppArtifact } from "@Src/services";
import Entity_ from "@Src/utils/entity-utils";
// import Modifier_ from "@Src/utils/modifier-utils";
// import Object_ from "@Src/utils/object-utils";
// import { importSetup } from "@Store/calculator-slice";
// import { useDispatch } from "@Store/hooks";

// Component
import { ArtifactCard, GenshinImage, ItemThumbnail } from "@Src/components";

interface ResultDisplayProps {
  // setup: CalcSetup;
  // artifactModConfigs: OptimizerAllArtifactModConfigs;
  moreActions?: ButtonProps[];
  // onRequestReturn: () => void;
  // onRequestExit: () => void;
  // onRequestLoadToCalculator: (indexes: number[]) => void;
}
export function ResultDisplay({ moreActions = [] }: ResultDisplayProps) {
  // const dispatch = useDispatch();

  const [selected, setSelected] = useState<Artifact>();
  const [exiting, setExiting] = useState(false);
  const {
    status: { result },
    close,
  } = useOptimizerState();

  const confirmTriggerRef = useClickOutside<HTMLDivElement>(() => setExiting(false));

  const selectedIndexes = useRef(new Set(result.map((_, i) => i)));
  const shouldSaveResult = useRef(false);
  const dataBySet = useRef<Record<number, AppArtifact>>({});
  const suffixes = ["st", "nd", "rd"];

  const onToggleCheckCalculation = (index: number, checked: boolean) => {
    checked ? selectedIndexes.current.add(index) : selectedIndexes.current.delete(index);
  };

  const loadResultToCalculator = () => {
    // const { buffs, debuffs } = props.artifactModConfigs;
    // let id = Date.now();
    // for (const index of selectedIndexes.current) {
    //   const { artifacts = [] } = result.at(index) || {};
    //   const artBuffCtrls = Modifier_.createMainArtifactBuffCtrls(artifacts)
    //     .map((control) => buffs[control.code])
    //     .flat();
    //   const artDebuffCtrls = Modifier_.createArtifactDebuffCtrls()
    //     .map((control) => debuffs[control.code])
    //     .flat();
    //   const calcSetup = Object_.clone(props.setup);
    //   calcSetup.artifacts = artifacts;
    //   calcSetup.artBuffCtrls = artBuffCtrls;
    //   calcSetup.artDebuffCtrls = artDebuffCtrls;
    //   dispatch(
    //     importSetup({
    //       importInfo: {
    //         ID: id++,
    //         type: "original",
    //         name: `Optimized ${index + 1}${suffixes[index]}`,
    //         calcSetup,
    //       },
    //     })
    //   );
    // }
    // props.onRequestExit();
  };

  const getSetData = (code: number) => {
    let data = dataBySet.current[code];

    if (!data) {
      data = $AppArtifact.getSet(code)!;
      dataBySet.current[code] = data;
    }
    return data;
  };

  const onClickExit = () => {
    if (exiting) {
      close(shouldSaveResult.current);
    } else {
      setExiting(!exiting);
    }
  };

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow flex flex-col" style={{ minWidth: 324 }}>
        <div className="pr-1 grow custom-scrollbar space-y-2">
          {result.map((calculation, index) => {
            const sets = GeneralCalc.getArtifactSetBonuses(calculation.artifacts).map(
              (bonus) => `(${bonus.bonusLv * 2 + 2}) ${getSetData(bonus.code).name}`
            );

            return (
              <div key={index} className="p-4 rounded-md bg-surface-1">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <div className="w-12 text-2xl font-black text-danger-2">
                      {index + 1}
                      {suffixes[index]}
                    </div>

                    <div className="ml-4 flex flex-col justify-center text-sm">
                      {sets.map((set, i) => (
                        <p key={i}>{set}</p>
                      ))}
                    </div>
                  </div>

                  <Checkbox
                    size="medium"
                    defaultChecked
                    onChange={(checked) => onToggleCheckCalculation(index, checked)}
                  />
                </div>

                <div className="mt-2 grid grid-cols-5 gap-2">
                  {calculation.artifacts.map((artifact, artifactI) => {
                    if (artifact) {
                      const data = getSetData(artifact.code);

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

        <div className="mt-4 px-2 pb-1 flex justify-end gap-3">
          <div ref={confirmTriggerRef} className="relative">
            <Button
              variant={exiting ? "danger" : "default"}
              icon={<FaSignOutAlt className="text-base" />}
              onClick={onClickExit}
            >
              Exit
            </Button>

            <Popover
              active={exiting}
              className="bottom-full mb-3 pl-4 pr-1 py-1 bg-black text-light-default rounded-md shadow-white-glow"
              style={{
                width: "12.5rem",
                left: "50%",
                translate: "-50% 0",
              }}
              origin="bottom center"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">Tap again to exit.</p>
                <Button
                  className="shrink-0"
                  variant="custom"
                  size="large"
                  withShadow={false}
                  icon={<TimesSvg />}
                  onClick={() => setExiting(false)}
                />
              </div>
              <div className="py-2">
                <Checkbox onChange={(checked) => (shouldSaveResult.current = checked)}>Save the result</Checkbox>
              </div>
            </Popover>
          </div>

          <Button className="gap-1" icon={<FaFileUpload className="text-base" />} onClick={loadResultToCalculator}>
            Load to Calculator
          </Button>
        </div>
      </div>

      <ArtifactCard wrapperCls="w-68 shrink-0" withOwnerLabel artifact={selected} />
    </div>
  );
}

export function ResultModalCase(props: { active: boolean; children: React.ReactNode }) {
  return (
    <Modal
      active={props.active}
      title={<span className="text-lg">Optimizer / Result</span>}
      className={`bg-surface-2 ${Modal.LARGE_HEIGHT_CLS}`}
      style={{
        width: "45rem",
      }}
      closeOnMaskClick={false}
      withCloseButton={false}
      closeOnEscape={false}
      onClose={() => {}}
    >
      {props.children}
    </Modal>
  );
}
