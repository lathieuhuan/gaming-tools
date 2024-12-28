import { useEffect, useRef, useState } from "react";
import { Modal } from "rond";

import type { OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds } from "@Src/components";
import type { OptimizerState } from "../ContextProvider/OptimizerProvider";
import type { ArtifactManager } from "./controllers/artifact-manager";

import { useStoreSnapshot } from "@Src/features";
import { $AppWeapon } from "@Src/services";
import { useCharacterData, useOptimizerState, usePartyData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { CalcItemSelect, SelectedCalcItem } from "./components/CalcItemSelect";
// import { ExtraConfigs } from "./components/ExtraConfigs";
import { OptimizationGuide, OptimizationGuideControl, StepConfig } from "./components/OptimizationGuide";
import { Launcher } from "./components/Launcher";
import { ResultDisplay } from "./components/ResultDisplay";

type SavedValues = {
  calcItem?: SelectedCalcItem;
  extraConfigs?: OptimizerExtraConfigs;
};

const STEP_KEY = {
  ARTIFACTS: "ARTIFACTS",
  MODIFIERS: "MODIFIERS",
  CALC_ITEMS: "CALC_ITEMS",
  LAUNCHER: "LAUNCHER",
} as const;

type StepKey = (typeof STEP_KEY)[keyof typeof STEP_KEY];

export function OptimizationDept() {
  const { status, optimizer, toggle } = useOptimizerState();

  return status.active ? (
    <OptimizationFrontDesk processing={status.loading} optimizer={optimizer} onClose={() => toggle("active", false)} />
  ) : null;
}

interface OptimizationFrontDeskProps {
  processing: boolean;
  optimizer: OptimizerState["optimizer"];
  onClose: () => void;
}
function OptimizationFrontDesk(props: OptimizationFrontDeskProps) {
  const { optimizer } = props;

  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = calculator.setupsById[calculator.activeId];
    const target = calculator.target;
    const artifacts = userdb.userArts;
    const appWeapon = $AppWeapon.get(setup.weapon.code)!;

    return {
      setup,
      target,
      appWeapon,
      artifacts,
    };
  });
  const appChar = useCharacterData();
  const partyData = usePartyData();
  const artifactManager = useArtifactManager(store.artifacts);

  const [activePieceSelect, setActivePieceSelect] = useState(false);
  const [resultStatus, setResultStatus] = useState<"EXIT" | "CLOSE" | "OPEN" | "REOPEN">("CLOSE");
  const [canShowGuideMenu, setCanShowGuideMenu] = useState(false);

  const guideControl = useRef<OptimizationGuideControl<StepKey>>(null);
  const savedValues = useRef<SavedValues>({});
  const setForPieceSelecte = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));
  const runCount = useRef(0);

  const isActiveResult = resultStatus === "OPEN" || resultStatus === "REOPEN";

  useEffect(() => {
    optimizer.init(store.target, store.setup, appChar, store.appWeapon, partyData);

    const unsubscribe = optimizer.subscribeCompletion(() => {
      guideControl.current?.toggle("ACTIVE", false);
      setResultStatus("OPEN");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const optimizeSetup = () => {
    const { calcItem, extraConfigs } = savedValues.current;

    runCount.current += 1;

    optimizer.optimize(
      {
        pattern: calcItem!.patternCate,
        calcItem: calcItem!.value,
        elmtModCtrls: store.setup.elmtModCtrls,
      },
      [artifactManager.buffConfigs, extraConfigs!]
    );
  };

  const togglePieceSelect = (active: boolean, code?: number) => {
    if (active && code) {
      setForPieceSelecte.current = artifactManager.getSet(code);
    }

    setActivePieceSelect(active);
    guideControl.current?.toggle("ACTIVE", !active);
  };

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(setForPieceSelecte.current.code, selectedIds);
    togglePieceSelect(false);
  };

  const onChangStep = (newStep: string, oldStep: string) => {
    switch (oldStep) {
      case STEP_KEY.ARTIFACTS: {
        const hasAnyNewSelected = artifactManager.concludeModConfigs();

        if (newStep !== STEP_KEY.MODIFIERS) {
          guideControl.current?.notify(
            hasAnyNewSelected
              ? {
                  message: "New Artifact modifiers configurations!",
                  toStep: "MODIFIERS",
                }
              : null
          );
        }
        break;
      }
      case STEP_KEY.MODIFIERS:
        artifactManager.recordSelectedSets();
        break;
    }

    switch (newStep) {
      case STEP_KEY.LAUNCHER: {
        setCanShowGuideMenu(true);

        const { sumary, calcCount } = artifactManager.sumarize();
        optimizer.load(sumary, calcCount.value);
        break;
      }
    }
  };

  const stepConfigs: StepConfig<StepKey>[] = [
    {
      key: STEP_KEY.ARTIFACTS,
      title: "Select Artifacts",
      render: (changeValid) => (
        <ArtifactSetSelect
          manager={artifactManager}
          onChangeValid={changeValid}
          onRequestSelectPieces={(code) => togglePieceSelect(true, code)}
        />
      ),
    },
    {
      key: STEP_KEY.MODIFIERS,
      title: "Artifact Modifiers",
      initialValid: true,
      render: () => <ArtifactModConfig manager={artifactManager} />,
    },
    {
      key: STEP_KEY.CALC_ITEMS,
      title: "Select Item",
      render: (changeValid) => (
        <CalcItemSelect
          calcList={appChar.calcList}
          initialValue={savedValues.current?.calcItem}
          onChange={(items) => (savedValues.current.calcItem = items[0])}
          onChangeValid={changeValid}
        />
      ),
    },
    // {
    //   title: "Extra Configurations",
    //   initialValid: true,
    //   render: () => (
    //     <ExtraConfigs
    //       initialValue={savedValues.current.extraConfigs}
    //       onChange={(value) => (savedValues.current.extraConfigs = value)}
    //     />
    //   ),
    // },
    {
      key: STEP_KEY.LAUNCHER,
      title: "Launcher",
      initialValid: true,
      render: () => (
        <Launcher
          manager={artifactManager}
          launchedOnce={runCount.current !== 0}
          onRequestLaunch={() => {
            guideControl.current?.notify(null);
            optimizeSetup();
          }}
          onRequestLastResult={() => {
            guideControl.current?.toggle("ACTIVE", false);
            setResultStatus("REOPEN");
          }}
          onRequestCancel={() => {}}
        />
      ),
    },
  ];

  return (
    <>
      <OptimizationGuide
        control={guideControl}
        stepConfigs={stepConfigs}
        canShowMenu={canShowGuideMenu}
        frozen={props.processing}
        onChangStep={onChangStep}
        afterClose={() => {
          if (!activePieceSelect && !isActiveResult) {
            props.onClose();
          }
        }}
      />

      <ItemMultiSelect
        active={activePieceSelect}
        title={<span className="text-lg">Optimize / Select Artifacts</span>}
        items={setForPieceSelecte.current.artifacts}
        initialValue={setForPieceSelecte.current.selectedIds}
        onClose={() => togglePieceSelect(false)}
        onConfirm={onConfirmSelectPieces}
      />

      <Modal
        active={isActiveResult}
        title={<span className="text-lg">Optimize / Result</span>}
        className={`bg-surface-2 ${Modal.LARGE_HEIGHT_CLS}`}
        style={{
          width: "45rem",
        }}
        closeOnMaskClick={false}
        withCloseButton={false}
        closeOnEscape={false}
        onClose={() => {}}
        onTransitionEnd={(open) => {
          if (!open && resultStatus === "EXIT") props.onClose();
        }}
      >
        <ResultDisplay
          onClickReturn={() => {
            setResultStatus("CLOSE");
            guideControl.current?.toggle("ACTIVE", true);
          }}
          onClickExit={() => setResultStatus("EXIT")}
          onClickLoadToCalculator={console.log}
        />
      </Modal>
    </>
  );
}
