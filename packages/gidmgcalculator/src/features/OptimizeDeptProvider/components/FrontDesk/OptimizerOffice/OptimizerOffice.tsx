import { useMemo, useRef, useState } from "react";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import isEqual from "react-fast-compare";
import { Button, ButtonProps, Checkbox, Modal } from "rond";
import { GeneralCalc } from "@Backend";

import type { ArtifactModCtrl } from "@Src/types";
import type { OptimizeDeptState } from "@OptimizeDept/OptimizeDept.types";
import type { ProcessedResult, ProcessedSetup } from "./OptimizerOffice.types";

import { useStoreSnapshot } from "@Src/features";
import { useOptimizeSystem } from "@OptimizeDept/hooks/useOptimizeSystem";
import Modifier_ from "@Src/utils/modifier-utils";
import Array_ from "@Src/utils/array-utils";

// Component
import { ProcessMonitor } from "./ProcessMonitor";
import { ResultDisplayer } from "./ResultDisplayer";
import { ConfirmButton, ConfirmButtonProps } from "./ConfirmButton";

type ProcessedData = {
  result: ProcessedResult;
  loadBtnProps: Pick<
    ConfirmButtonProps,
    "variant" | "popoverWidth" | "ctaText" | "askedContent" | "disabled" | "disabledAsking" | "onConfirm"
  >;
};

interface InternalOfficeProps {
  state: OptimizeDeptState;
  moreActions?: ButtonProps[];
  onChangeKeepResult: (keepResult: boolean) => void;
  onRequestClose: () => void;
  /** Already ordered the optimizer to end */
  onRequestCancel: () => void;
}
function InternalOffice({
  state,
  moreActions = [],
  onChangeKeepResult,
  onRequestCancel,
  onRequestClose,
}: InternalOfficeProps) {
  const MAX_SETUP_AFTER_LOAD = 5;
  const cancelled = state.status === "CANCELLED";
  const processing = state.status === "OPTIMIZING";
  const successful = !processing && state.result.length !== 0;

  const store = useStoreSnapshot(({ calculator }) => {
    return {
      activeSetup: calculator.setupsById[calculator.activeId],
      setupManageInfos: calculator.setupManageInfos,
      target: calculator.target,
    };
  });
  const [askingToExit, setAskingToExit] = useState(false);
  const [askingToLoad, setAskingToLoad] = useState(false);
  const [selectingResult, setSelectingResult] = useState(false);

  const keepProcess = useRef(false);

  const loadResultToCalculator = (setups: ProcessedSetup[]) => {
    console.log("loadResultToCalculator");

    console.log(setups);

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

  const processed: ProcessedData = useMemo(() => {
    let id = Date.now();
    //
    const result: ProcessedData["result"] = state.result.map(({ artifacts }) => {
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
        manageInfo: {
          ID: id++,
          name: "Optimized",
          type: "optimized",
        },
        artifacts,
        setBonuses,
        artBuffCtrls,
        artDebuffCtrls,
      };
    });

    let loadType: "NO_PROBLEM" | "MAX_SETUP_EXCEEDED" | "CONFLICTED" | "ERROR" = "NO_PROBLEM";
    let targetMutated = false;

    if (store.activeSetup && state.setup && state.recreationData.target) {
      if (store.activeSetup.char.name === state.setup.char.name) {
        const newSetupCount = store.setupManageInfos.length + state.result.length;

        if (newSetupCount > MAX_SETUP_AFTER_LOAD) {
          loadType = "MAX_SETUP_EXCEEDED";
        }
        targetMutated = !isEqual(store.target, state.recreationData.target);
      } else {
        loadType = "CONFLICTED";
      }
    } else {
      loadType = "ERROR";
    }

    let loadBtnProps: ProcessedData["loadBtnProps"] = {
      variant: "primary",
      popoverWidth: "15rem",
      ctaText: "Tap again to load",
      askedContent: "The current target is different and will be overwritten.",
    };

    switch (loadType) {
      case "ERROR":
        loadBtnProps = {
          variant: "default",
          popoverWidth: "12.5rem",
          ctaText: "Error",
          askedContent: "Cannot load to Calculator.",
          disabled: askingToLoad,
        };
        break;
      case "CONFLICTED":
        loadBtnProps.askedContent = (
          <>
            The current character is different.{" "}
            <span className="text-danger-2 font-semibold">We will start a new session.</span>
          </>
        );
        loadBtnProps.onConfirm = () => loadResultToCalculator(result.map((item) => item.manageInfo));
        break;
      case "MAX_SETUP_EXCEEDED":
        loadBtnProps.disabledAsking = true;
        loadBtnProps.onConfirm = () => setSelectingResult(true);
        break;
      case "NO_PROBLEM":
        loadBtnProps.disabledAsking = !targetMutated;
        loadBtnProps.onConfirm = () => loadResultToCalculator(result.map((item) => item.manageInfo));
        break;
    }

    return {
      result,
      loadBtnProps,
    };
  }, [state.result, state.artifactModConfigs]);

  const onChangeKeepProcess = (keep: boolean) => {
    keepProcess.current = keep;
    onChangeKeepResult(keep);
  };

  const onConfirmExit = () => {
    onRequestClose();

    if (processing && !cancelled && !keepProcess.current) {
      onRequestCancel();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {successful ? (
        <ResultDisplayer
          processedResult={processed.result}
          selectingResult={selectingResult}
          setups={store.setupManageInfos}
          maxSelected={MAX_SETUP_AFTER_LOAD}
          onCancelSelecting={() => setSelectingResult(false)}
          onRequestLoad={loadResultToCalculator}
        />
      ) : (
        <div className="grow flex justify-center">
          <ProcessMonitor
            className="max-w-full"
            style={{ width: "27rem" }}
            cancelled={cancelled}
            onRequestCancel={onRequestCancel}
          />
        </div>
      )}

      <div className="mt-4 pb-1 flex justify-end gap-3">
        {moreActions.map((action, i) => (
          <Button key={i} {...action} />
        ))}

        <ConfirmButton
          variant="danger"
          popoverWidth="12.5rem"
          asking={askingToExit}
          ctaText="Tap again to exit"
          askedContent={
            processing ? (
              <Checkbox onChange={onChangeKeepProcess}>Keep the process</Checkbox>
            ) : (
              <Checkbox onChange={onChangeKeepResult}>Keep the result</Checkbox>
            )
          }
          icon={<FaSignOutAlt className="text-base" />}
          disabledAsking={cancelled}
          toggleAsking={setAskingToExit}
          onConfirm={onConfirmExit}
        >
          Exit
        </ConfirmButton>

        {successful && !selectingResult ? (
          <ConfirmButton
            className="gap-1"
            asking={askingToLoad}
            icon={<FaFileUpload className="text-base" />}
            toggleAsking={setAskingToLoad}
            {...processed.loadBtnProps}
          >
            Load Result
          </ConfirmButton>
        ) : null}
      </div>

      {(askingToExit || askingToLoad) && <div className="absolute full-stretch z-10 bg-black/60" />}
    </div>
  );
}

interface ResultDisplayProps extends Pick<InternalOfficeProps, "moreActions" | "onRequestClose"> {
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

  const afterCloseOffice = () => {
    if (closeDeptAfterCloseOffice) {
      onCloseDept(shouldKeepResult.current);
    }
    shouldKeepResult.current = false;
  };

  return (
    <Modal
      active={active}
      title={<span className="text-lg">Optimizer / Processing & Result</span>}
      className={["bg-surface-2", Modal.LARGE_HEIGHT_CLS, Modal.MAX_SIZE_CLS]}
      style={{
        width: "45rem",
      }}
      closeOnMaskClick={false}
      withCloseButton={false}
      closeOnEscape={false}
      onTransitionEnd={(open) => {
        if (!open) afterCloseOffice();
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
