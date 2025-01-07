import { useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { Button, ButtonProps, Checkbox, CloseButton, Modal, Popover, PopoverProps, useClickOutside } from "rond";

import type { Artifact } from "@Src/types";
import type { OptimizeDirector } from "@Src/screens/Calculator/ContextProvider";

// Component
import { ArtifactCard } from "@Src/components";
import { ProcessMonitor } from "./ProcessMonitor";
import { ResultDisplayer } from "./ResultDisplayer";

interface InternalOptimizerOfficeProps {
  // setup: CalcSetup;
  // artifactModConfigs: OptimizerAllArtifactModConfigs;
  director: OptimizeDirector;
  moreActions?: ButtonProps[];
  onChangeKeepResult: (keepResult: boolean) => void;
  onClose: () => void;
  /** Already ordered the optimizer to end */
  onCancel?: () => void;
}
function InternalOptimizerOffice(props: InternalOptimizerOfficeProps) {
  const { director, moreActions = [] } = props;
  const { state, optimizer } = props.director;
  const cancelled = state.optimizerStatus === "CANCELLED";
  const loading = state.optimizerStatus === "WORKING";

  const [selected, setSelected] = useState<Artifact>();
  const [exiting, setExiting] = useState(false);

  const selectedIndexes = useRef(new Set(state.result.map((_, i) => i)));
  const keepProcess = useRef(false);
  const confirmTriggerRef = useClickOutside<HTMLDivElement>(() => setExiting(false));

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

  const onToggleCheckCalculation = (index: number, checked: boolean) => {
    checked ? selectedIndexes.current.add(index) : selectedIndexes.current.delete(index);
  };

  const onChangeKeepProcess = (keep: boolean) => {
    keepProcess.current = keep;
    props.onChangeKeepResult(keep);
  };

  const onCancel = () => {
    director.cancel();
    props.onCancel?.();
  };

  const onClickExit = () => {
    if (cancelled || exiting) {
      if (!cancelled && !keepProcess.current) {
        onCancel();
      }
      props.onClose();
    } else {
      setExiting(!exiting);
    }
  };

  const popoverProps: Pick<PopoverProps, "style" | "origin"> = moreActions.length
    ? {
        style: {
          width: "12.5rem",
          left: "50%",
          translate: "-50% 0",
        },
        origin: "bottom center",
      }
    : {
        style: {
          width: "12.5rem",
          left: 0,
        },
        origin: "bottom left",
      };

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow flex flex-col" style={{ minWidth: 324 }}>
        <div className="grow">
          {loading || cancelled ? (
            <ProcessMonitor optimizer={optimizer} cancelled={cancelled} onRequestCancel={onCancel} />
          ) : (
            <ResultDisplayer
              selectedArtifactId={selected?.ID}
              result={state.result}
              onSelectArtifact={setSelected}
              onToggleCheckCalculation={onToggleCheckCalculation}
            />
          )}
        </div>

        <div className="mt-4 px-2 pb-1 flex gap-3">
          {moreActions.map((action, i) => (
            <Button key={i} {...action} />
          ))}

          <div ref={confirmTriggerRef} className="relative">
            <Button
              className="relative z-20"
              variant={exiting ? "danger" : "default"}
              icon={<FaSignOutAlt className="text-base" />}
              onClick={onClickExit}
            >
              Exit
            </Button>

            <Popover
              active={exiting}
              className="z-20 bottom-full mb-3 pl-4 pr-1 py-1 shadow-white-glow"
              withTooltipStyle
              {...popoverProps}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">Tap again to exit.</p>
                <CloseButton className="shrink-0" boneOnly onClick={() => setExiting(false)} />
              </div>

              <div className="py-2">
                {loading ? (
                  <Checkbox onChange={onChangeKeepProcess}>Keep the process</Checkbox>
                ) : (
                  <Checkbox onChange={props.onChangeKeepResult}>Keep the result</Checkbox>
                )}
              </div>
            </Popover>
          </div>

          {!loading && state.result.length ? (
            <Button
              className="ml-auto gap-1"
              icon={<FaFileUpload className="text-base" />}
              onClick={loadResultToCalculator}
            >
              Load to Calculator
            </Button>
          ) : null}
        </div>
      </div>

      <ArtifactCard wrapperCls="w-68 shrink-0" withOwnerLabel artifact={selected} />

      {exiting && <div className="absolute full-stretch z-10 bg-black/60" />}
    </div>
  );
}

interface ResultDisplayProps
  extends Pick<InternalOptimizerOfficeProps, "director" | "moreActions" | "onCancel" | "onClose"> {
  active: boolean;
  closeDeptAfterCloseOffice: boolean;
}
export function OptimizerOffice({ active, director, closeDeptAfterCloseOffice, ...internalProps }: ResultDisplayProps) {
  const shouldKeepResult = useRef(false);

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimizer / Process & Result</span>}
      className={`bg-surface-2 ${Modal.LARGE_HEIGHT_CLS}`}
      style={{
        width: "45rem",
      }}
      closeOnMaskClick={false}
      withCloseButton={false}
      closeOnEscape={false}
      onTransitionEnd={(open) => {
        if (!open) {
          if (closeDeptAfterCloseOffice) {
            director.close(shouldKeepResult.current);
          }
          shouldKeepResult.current = false;
        }
      }}
      onClose={() => {}}
    >
      <InternalOptimizerOffice
        {...internalProps}
        director={director}
        onChangeKeepResult={(keepResult) => (shouldKeepResult.current = keepResult)}
      />
    </Modal>
  );
}
