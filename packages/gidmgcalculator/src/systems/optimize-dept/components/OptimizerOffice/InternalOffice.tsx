import { useMemo, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { FaFileUpload, FaSignOutAlt } from "react-icons/fa";
import { Button, ButtonProps, Checkbox } from "rond";

import type { ArtifactModCtrl } from "@/types";
import type { OptimizeDeptState } from "@OptimizeDept/types";
import type { ProcessedResult, ProcessedSetup } from "./types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import Modifier_ from "@/utils/Modifier";
import Object_ from "@/utils/Object";
import { GeneralCalc } from "@Calculation";
import { importSetup, removeCalcSetup } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";

// Component
import { ConfirmButton, type ConfirmButtonProps } from "./components/ConfirmButton";
import { ProcessMonitor } from "./components/ProcessMonitor";
import { ResultDisplayer } from "./components/ResultDisplayer";

type ProcessedData = {
  result: ProcessedResult;
  loadBtnProps: Pick<
    ConfirmButtonProps,
    "variant" | "popoverWidth" | "ctaText" | "askedContent" | "disabled" | "disabledAsking" | "onConfirm"
  >;
};

export type InternalOfficeProps = {
  state: OptimizeDeptState;
  moreActions?: ButtonProps[];
  onExpectedSetupsChange: (ids: number[]) => void;
  onKeepResultChange: (keepResult: boolean) => void;
  onClose: () => void;
  /** Already ordered the optimizer to end */
  onCancelProcess: () => void;
};

export function InternalOffice({
  state,
  moreActions = [],
  onExpectedSetupsChange,
  onKeepResultChange,
  onCancelProcess,
  onClose,
}: InternalOfficeProps) {
  const MAX_SETUP_AFTER_LOAD = 5;
  const cancelled = state.status === "CANCELLED";
  const processing = state.status === "OPTIMIZING";
  const successful = !processing && state.result.length !== 0;

  const dispatch = useDispatch();
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

  const loadResultToCalculator = (setups: ProcessedSetup[], processedResult: ProcessedResult) => {
    const suffixes = ["st", "nd", "rd"];
    const removedSetupIds = new Set(store.setupManageInfos.map((info) => info.ID));
    const expectedSetupIds: number[] = [];
    let index = -1;

    for (const setup of setups) {
      if (setup.type === "optimized") {
        const data = processedResult.find((item) => item.manageInfo.ID === setup.ID);
        if (!data) continue;
        const calcSetup = Object_.clone(state.setup)!;

        calcSetup.artifacts = data.artifacts;
        calcSetup.artBuffCtrls = data.artBuffCtrls;
        calcSetup.artDebuffCtrls = data.artDebuffCtrls;
        index++;

        expectedSetupIds.push(setup.ID);

        dispatch(
          importSetup({
            importInfo: {
              ID: setup.ID,
              type: "original",
              name: `Optimized ${index + 1}${suffixes[index]}`,
              calcSetup,
              target: state.target,
            },
            shouldOverwriteTarget: true,
          })
        );
      } else {
        removedSetupIds.delete(setup.ID);
      }
    }

    removedSetupIds.forEach((id) => dispatch(removeCalcSetup(id)));

    onExpectedSetupsChange(expectedSetupIds);
    onClose();
  };

  const processedData: ProcessedData = useMemo(() => {
    let id = Date.now();
    //
    const result: ProcessedResult = state.result.map(({ artifacts }) => {
      const { artifactModConfigs = { buffs: {}, debuffs: {} } } = state;
      const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);
      const artBuffCtrls: ArtifactModCtrl[] = [];
      const artDebuffCtrls: ArtifactModCtrl[] = [];

      for (const control of Modifier_.createMainArtifactBuffCtrls(artifacts, setBonuses)) {
        const buffCtrl = Array_.findByIndex(artifactModConfigs.buffs[control.code], control.index);
        if (buffCtrl) artBuffCtrls.push(buffCtrl);
      }
      for (const control of Modifier_.createArtifactDebuffCtrls()) {
        // bonusLv 1 is 4-set bonus, debuffs only on this type of bonus
        if (setBonuses.some((bonus) => bonus.code === control.code && bonus.bonusLv)) {
          const debuffCtrl = Array_.findByIndex(artifactModConfigs.debuffs[control.code], control.index);

          if (debuffCtrl) {
            artDebuffCtrls.push(debuffCtrl);
          }
        } else {
          artDebuffCtrls.push(control);
        }
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

    if (store.activeSetup && state.setup && state.target) {
      if (store.activeSetup.char.name === state.setup.char.name) {
        const newSetupCount = store.setupManageInfos.length + state.result.length;

        if (newSetupCount > MAX_SETUP_AFTER_LOAD) {
          loadType = "MAX_SETUP_EXCEEDED";
        }
        targetMutated = !isEqual(store.target, state.target);
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
      askedContent: "The current Target is different and will be overwritten.",
    };
    const onConfirm = () => {
      const setups: ProcessedSetup[] = store.setupManageInfos;
      loadResultToCalculator(setups.concat(result.map((item) => item.manageInfo)), result);
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
        loadBtnProps.onConfirm = onConfirm;
        break;
      case "MAX_SETUP_EXCEEDED":
        loadBtnProps.disabledAsking = true;
        loadBtnProps.onConfirm = () => setSelectingResult(true);
        break;
      case "NO_PROBLEM":
        loadBtnProps.disabledAsking = !targetMutated;
        loadBtnProps.onConfirm = onConfirm;
        break;
    }

    return {
      result,
      loadBtnProps,
    };
  }, [state.result, state.artifactModConfigs]);

  const onKeepProcessChange = (keep: boolean) => {
    keepProcess.current = keep;
    onKeepResultChange(keep);
  };

  const onConfirmExit = () => {
    onClose();

    if (processing && !cancelled && !keepProcess.current) {
      onCancelProcess();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {successful ? (
        <ResultDisplayer
          processedResult={processedData.result}
          selectingResult={selectingResult}
          setups={store.setupManageInfos}
          maxSelected={MAX_SETUP_AFTER_LOAD}
          onCancelSelecting={() => setSelectingResult(false)}
          onLoadSetups={(setups) => loadResultToCalculator(setups, processedData.result)}
        />
      ) : (
        <div className="grow flex justify-center">
          <ProcessMonitor
            className="max-w-full"
            style={{ width: "27rem" }}
            cancelled={cancelled}
            onCancelProcess={onCancelProcess}
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
              <Checkbox onChange={onKeepProcessChange}>Keep the process</Checkbox>
            ) : (
              <Checkbox onChange={onKeepResultChange}>Keep the result</Checkbox>
            )
          }
          icon={<FaSignOutAlt className="text-base" />}
          disabledAsking={cancelled}
          onAskingChange={setAskingToExit}
          onConfirm={onConfirmExit}
        >
          Exit
        </ConfirmButton>

        {successful && !selectingResult ? (
          <ConfirmButton
            className="gap-1"
            asking={askingToLoad}
            icon={<FaFileUpload className="text-base" />}
            onAskingChange={setAskingToLoad}
            {...processedData.loadBtnProps}
          >
            Load Result
          </ConfirmButton>
        ) : null}
      </div>

      {(askingToExit || askingToLoad) && <div className="absolute full-stretch z-10 bg-black/60" />}
    </div>
  );
}
