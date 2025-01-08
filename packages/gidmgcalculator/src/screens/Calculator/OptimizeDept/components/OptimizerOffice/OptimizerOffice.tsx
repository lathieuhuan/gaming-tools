import { useMemo, useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { Button, ButtonProps, Checkbox, Modal } from "rond";
import { GeneralCalc } from "@Backend";

import type { Artifact, ArtifactModCtrl } from "@Src/types";
import type { OptimizeSystem } from "@Src/screens/Calculator/ContextProvider";
import type { ProcessedResult } from "./OptimizerOffice.types";

import { useStore } from "@Src/features";
import Modifier_ from "@Src/utils/modifier-utils";
import Array_ from "@Src/utils/array-utils";

// Component
import { ArtifactCard } from "@Src/components";
import { ProcessMonitor } from "./ProcessMonitor";
import { ResultDisplayer } from "./ResultDisplayer";
import { ConfirmButton } from "./ConfirmButton";

interface InternalOfficeProps {
  system: OptimizeSystem;
  moreActions?: ButtonProps[];
  onChangeKeepResult: (keepResult: boolean) => void;
  onClose: () => void;
  /** Already ordered the optimizer to end */
  onCancel?: () => void;
}
function InternalOffice(props: InternalOfficeProps) {
  const MAX_SETUP_AFTER_LOAD = 5;
  const { system, moreActions = [] } = props;
  const { state, optimizer } = props.system;
  const cancelled = state.status === "CANCELLED";
  const processing = state.status === "WORKING";
  const loadableToCalc = !processing && state.result.length !== 0;

  const store = useStore();
  const [selected, setSelected] = useState<Artifact>();
  const [askingToExit, setAskingToExit] = useState(false);
  const [askingToLoad, setAskingToLoad] = useState(false);

  const selectedIndexes = useRef(new Set(state.result.map((_, i) => i)));
  const keepProcess = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const processed: ProcessedResult = useMemo(() => {
    return state.result.map(({ artifacts }) => {
      const modConfigs = state.artifactModConfigs;
      const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
      const artBuffCtrls: ArtifactModCtrl[] = [];
      const artDebuffCtrls: ArtifactModCtrl[] = [];

      for (const control of Modifier_.createMainArtifactBuffCtrls(artifacts, setBonuses)) {
        const buffCtrl = Array_.findByIndex(modConfigs.buffs[control.code], control.index);
        if (buffCtrl) artBuffCtrls.push(buffCtrl);
      }
      for (const control of Modifier_.createArtifactDebuffCtrls()) {
        const debuffCtrl = Array_.findByIndex(modConfigs.debuffs[control.code], control.index);
        if (debuffCtrl) artDebuffCtrls.push(debuffCtrl);
      }

      return {
        setBonuses,
        artBuffCtrls,
        artDebuffCtrls,
      };
    });
  }, [state.result, state.artifactModConfigs]);

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

  const onClickLoadResult = () => {
    const calculator = store.select((state) => state.calculator);
    const activeSetup = calculator.setupsById[calculator.activeId];

    if (activeSetup && state.setup) {
      if (activeSetup.char.name === state.setup.char.name) {
        const totalSetupCount = calculator.setupManageInfos.length + state.result.length;

        if (totalSetupCount > MAX_SETUP_AFTER_LOAD) {
          //
        } else {
          //
        }
      }
    }
  };

  const onToggleCheckCalculation = (index: number, checked: boolean) => {
    checked ? selectedIndexes.current.add(index) : selectedIndexes.current.delete(index);
  };

  const onSelectArtifact = (artifact: Artifact) => {
    setSelected(artifact);

    if (bodyRef.current) bodyRef.current.scrollLeft = 999;
  };

  const onChangeKeepProcess = (keep: boolean) => {
    keepProcess.current = keep;
    props.onChangeKeepResult(keep);
  };

  const cancelProcess = () => {
    system.cancelProcess();
    props.onCancel?.();
  };

  const exit = () => {
    props.onClose();

    if (processing && !cancelled && !keepProcess.current) {
      cancelProcess();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div ref={bodyRef} className="grow flex gap-2 hide-scrollbar scroll-smooth">
        <div className="grow custom-scrollbar" style={{ minWidth: 360 }}>
          {processing || cancelled ? (
            <ProcessMonitor optimizer={optimizer} cancelled={cancelled} onRequestCancel={cancelProcess} />
          ) : (
            <ResultDisplayer
              selectedArtifactId={selected?.ID}
              result={state.result}
              processedResult={processed}
              onSelectArtifact={onSelectArtifact}
              onToggleCheckCalculation={onToggleCheckCalculation}
            />
          )}
        </div>

        <div>
          <ArtifactCard style={{ height: "28rem" }} wrapperCls="w-68 shrink-0" withOwnerLabel artifact={selected} />
        </div>
      </div>

      <div className="mt-4 pb-1 flex justify-end gap-3">
        {moreActions.map((action, i) => (
          <Button key={i} {...action} />
        ))}

        <ConfirmButton
          variant="danger"
          popoverWidth="12.5rem"
          asking={askingToExit}
          askingTitle="Tap again to exit."
          askingContent={
            <div className="py-2">
              {processing ? (
                <Checkbox onChange={onChangeKeepProcess}>Keep the process</Checkbox>
              ) : (
                <Checkbox onChange={props.onChangeKeepResult}>Keep the result</Checkbox>
              )}
            </div>
          }
          disabledAsking={cancelled}
          icon={<FaSignOutAlt className="text-base" />}
          toggleAsking={setAskingToExit}
          onConfirm={exit}
        >
          Exit
        </ConfirmButton>

        {loadableToCalc ? (
          <ConfirmButton
            variant="primary"
            popoverWidth="15rem"
            className="gap-1"
            asking={askingToLoad}
            askingTitle="Tap again to load."
            askingContent={<p className="py-2">The current target is different and will be overwritten.</p>}
            icon={<FaFileUpload className="text-base" />}
            toggleAsking={setAskingToLoad}
            onConfirm={loadResultToCalculator}
          >
            Load Result
          </ConfirmButton>
        ) : null}
      </div>

      {(askingToExit || askingToLoad) && <div className="absolute full-stretch z-10 bg-black/60" />}
    </div>
  );
}

interface ResultDisplayProps extends Pick<InternalOfficeProps, "system" | "moreActions" | "onCancel" | "onClose"> {
  active: boolean;
  closeDeptAfterCloseOffice: boolean;
}
export function OptimizerOffice({ active, system, closeDeptAfterCloseOffice, ...internalProps }: ResultDisplayProps) {
  const shouldKeepResult = useRef(false);

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimizer / Process & Result</span>}
      className={["bg-surface-2", Modal.LARGE_HEIGHT_CLS, Modal.MAX_SIZE_CLS]}
      style={{
        width: "45rem",
      }}
      closeOnMaskClick={false}
      withCloseButton={false}
      closeOnEscape={false}
      onTransitionEnd={(open) => {
        if (!open) {
          if (closeDeptAfterCloseOffice) {
            system.closeDept(shouldKeepResult.current);
          }
          shouldKeepResult.current = false;
        }
      }}
      onClose={() => {}}
    >
      <InternalOffice
        {...internalProps}
        system={system}
        onChangeKeepResult={(keepResult) => (shouldKeepResult.current = keepResult)}
      />
    </Modal>
  );
}
