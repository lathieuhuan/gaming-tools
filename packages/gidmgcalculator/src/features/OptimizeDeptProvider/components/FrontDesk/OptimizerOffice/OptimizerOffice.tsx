import { useMemo, useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import isEqual from "react-fast-compare";
import { Button, ButtonProps, Checkbox, Modal } from "rond";
import { GeneralCalc } from "@Backend";

import type { Artifact, ArtifactModCtrl } from "@Src/types";
import type { OptimizeDeptState } from "@OptimizeDept/OptimizeDept.types";
import type { ProcessedResult } from "./OptimizerOffice.types";

import { useStoreSnapshot } from "@Src/features";
import { useOptimizeSystem } from "@OptimizeDept/hooks/useOptimizeSystem";
import Modifier_ from "@Src/utils/modifier-utils";
import Array_ from "@Src/utils/array-utils";

// Component
import { ArtifactCard } from "@Src/components";
import { ProcessMonitor } from "./ProcessMonitor";
import { ResultDisplayer } from "./ResultDisplayer";
import { ConfirmButton, ConfirmButtonProps } from "./ConfirmButton";

type LoadType = "NO_PROBLEM" | "MAX_SETUP_EXCEEDED" | "CONFLICTED" | "ERROR";

type ProcessedData = {
  result: ProcessedResult;
  loadType: LoadType;
  targetMutated?: boolean;
};

interface InternalOfficeProps {
  state: OptimizeDeptState;
  moreActions?: ButtonProps[];
  onChangeKeepResult: (keepResult: boolean) => void;
  onClose: () => void;
  /** Already ordered the optimizer to end */
  onRequestCancel: () => void;
}
function InternalOffice(props: InternalOfficeProps) {
  const MAX_SETUP_AFTER_LOAD = 5;
  const { state, moreActions = [] } = props;
  const cancelled = state.status === "CANCELLED";
  const processing = state.status === "OPTIMIZING";
  const loadableToCalc = !processing && state.result.length !== 0;

  const store = useStoreSnapshot(({ calculator }) => {
    return {
      activeSetup: calculator.setupsById[calculator.activeId],
      setupManageInfos: calculator.setupManageInfos,
      target: calculator.target,
    };
  });
  const [selected, setSelected] = useState<Artifact>();
  const [askingToExit, setAskingToExit] = useState(false);
  const [askingToLoad, setAskingToLoad] = useState(false);

  const selectedIndexes = useRef(new Set(state.result.map((_, i) => i)));
  const keepProcess = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const processed: ProcessedData = useMemo(() => {
    let loadType: LoadType = "NO_PROBLEM";
    let targetMutated = false;

    if (store.activeSetup && state.setup && state.recreationData.target) {
      if (store.activeSetup.char.name === state.setup.char.name) {
        const newSetupCount = store.setupManageInfos.length + state.result.length;

        if (newSetupCount > MAX_SETUP_AFTER_LOAD) {
          loadType = "MAX_SETUP_EXCEEDED";
        }
        targetMutated = isEqual(store.target, state.recreationData.target);
      } else {
        loadType = "CONFLICTED";
      }
    } else {
      loadType = "ERROR";
    }

    const result = state.result.map(({ artifacts }) => {
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

    return {
      result,
      loadType,
      targetMutated,
    };
  }, [state.result, state.artifactModConfigs]);

  const loadResultToCalculator = () => {
    console.log("loadResultToCalculator");

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
    switch (processed.loadType) {
      case "NO_PROBLEM":
        loadResultToCalculator();
        break;
      case "MAX_SETUP_EXCEEDED":
        break;
      case "CONFLICTED":
        break;
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
    props.onRequestCancel();
  };

  const exit = () => {
    props.onClose();

    if (processing && !cancelled && !keepProcess.current) {
      cancelProcess();
    }
  };

  const loadConfirmBtnProps: Pick<
    ConfirmButtonProps,
    "variant" | "disabled" | "ctaText" | "askedContent" | "popoverWidth"
  > =
    processed.loadType === "ERROR"
      ? {
          variant: "default",
          popoverWidth: "12.5rem",
          ctaText: "Error",
          askedContent: "Cannot load to Calculator.",
          disabled: askingToLoad,
        }
      : {
          variant: "danger",
          popoverWidth: "15rem",
          ctaText: "Tap again to load.",
          askedContent: "The current target is different and will be overwritten.",
        };

  return (
    <div className="h-full flex flex-col">
      <div ref={bodyRef} className="grow flex gap-2 hide-scrollbar scroll-smooth">
        <div className="grow custom-scrollbar" style={{ minWidth: 360 }}>
          {processing || cancelled ? (
            <ProcessMonitor cancelled={cancelled} onRequestCancel={cancelProcess} />
          ) : (
            <ResultDisplayer
              selectedArtifactId={selected?.ID}
              result={state.result}
              processedResult={processed.result}
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
          ctaText="Tap again to exit."
          askedContent={
            processing ? (
              <Checkbox onChange={onChangeKeepProcess}>Keep the process</Checkbox>
            ) : (
              <Checkbox onChange={props.onChangeKeepResult}>Keep the result</Checkbox>
            )
          }
          icon={<FaSignOutAlt className="text-base" />}
          disabledAsking={cancelled}
          toggleAsking={setAskingToExit}
          onConfirm={exit}
        >
          Exit
        </ConfirmButton>

        {loadableToCalc ? (
          <ConfirmButton
            {...loadConfirmBtnProps}
            className="gap-1"
            asking={askingToLoad}
            icon={<FaFileUpload className="text-base" />}
            disabledAsking={
              !(processed.loadType === "ERROR" || (processed.loadType === "NO_PROBLEM" && processed.targetMutated))
            }
            toggleAsking={setAskingToLoad}
            onConfirm={onClickLoadResult}
          >
            Load Result
          </ConfirmButton>
        ) : null}
      </div>

      {(askingToExit || askingToLoad) && <div className="absolute full-stretch z-10 bg-black/60" />}
    </div>
  );
}

interface ResultDisplayProps extends Pick<InternalOfficeProps, "moreActions" | "onClose"> {
  active: boolean;
  closeDeptAfterCloseOffice: boolean;
  onCancel?: () => void;
  onCloseDept: (keepResult: boolean) => void;
}
export function OptimizerOffice({
  active,
  closeDeptAfterCloseOffice,
  onCancel,
  onCloseDept,
  ...internalProps
}: ResultDisplayProps) {
  const shouldKeepResult = useRef(false);
  const system = useOptimizeSystem();

  const cancelProcess = () => {
    system.cancelProcess();
    onCancel?.();
  };

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
            onCloseDept(shouldKeepResult.current);
          }
          shouldKeepResult.current = false;
        }
      }}
      onClose={() => {}}
    >
      <InternalOffice
        {...internalProps}
        state={system.state}
        onChangeKeepResult={(keepResult) => (shouldKeepResult.current = keepResult)}
        onRequestCancel={cancelProcess}
      />
    </Modal>
  );
}
