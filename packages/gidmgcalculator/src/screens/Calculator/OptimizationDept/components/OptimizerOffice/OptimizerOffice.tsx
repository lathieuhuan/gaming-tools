import { useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { Button, ButtonProps, Checkbox, CloseButton, Modal, Popover, useClickOutside } from "rond";

import type { Artifact } from "@Src/types";
import type { OptimizerState } from "@Src/screens/Calculator/ContextProvider";

// Component
import { ArtifactCard } from "@Src/components";
import { ProcessMonitor } from "./ProcessMonitor";
import { ResultDisplayer } from "./ResultDisplayer";

interface InternalOptimizerOfficeProps {
  // setup: CalcSetup;
  // artifactModConfigs: OptimizerAllArtifactModConfigs;
  optimizerState: OptimizerState;
  moreActions?: ButtonProps[];
  onChangeKeepResult: (keepResult: boolean) => void;
  onClose: () => void;
  /** Already order the optimizer to end */
  onCancel?: () => void;
}
function InternalOptimizerOffice(props: InternalOptimizerOfficeProps) {
  const { moreActions = [] } = props;

  const { status, optimizer, setLoading } = props.optimizerState;
  const [selected, setSelected] = useState<Artifact>();
  const [cancelled, setCancelled] = useState(false);
  const [exiting, setExiting] = useState(false);

  const selectedIndexes = useRef(new Set(status.result.map((_, i) => i)));
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
    optimizer.end();
    setCancelled(true);
    setLoading(false);
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

  return (
    <div className="h-full flex custom-scrollbar gap-2 scroll-smooth">
      <div className="grow flex flex-col" style={{ minWidth: 324 }}>
        <div className="grow">
          {status.loading || cancelled ? (
            <ProcessMonitor cancelled={cancelled} onRequestCancel={onCancel} />
          ) : (
            <ResultDisplayer
              selectedArtifactId={selected?.ID}
              result={status.result}
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
                <CloseButton className="shrink-0" boneOnly onClick={() => setExiting(false)} />
              </div>

              <div className="py-2">
                {status.loading ? (
                  <Checkbox onChange={onChangeKeepProcess}>Keep the process</Checkbox>
                ) : (
                  <Checkbox onChange={props.onChangeKeepResult}>Reserve the result</Checkbox>
                )}
              </div>
            </Popover>
          </div>

          {!status.loading && status.result.length ? (
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
    </div>
  );
}

interface ResultDisplayProps
  extends Pick<InternalOptimizerOfficeProps, "optimizerState" | "moreActions" | "onCancel" | "onClose"> {
  active: boolean;
  closeDeptAfterCloseOffice: boolean;
}
export function OptimizerOffice({
  active,
  optimizerState,
  closeDeptAfterCloseOffice,
  ...internalProps
}: ResultDisplayProps) {
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
            optimizerState.close(shouldKeepResult.current);
          }
          shouldKeepResult.current = false;
        }
      }}
      onClose={() => {}}
    >
      <InternalOptimizerOffice
        {...internalProps}
        optimizerState={optimizerState}
        onChangeKeepResult={(keepResult) => (shouldKeepResult.current = keepResult)}
      />
    </Modal>
  );
}
