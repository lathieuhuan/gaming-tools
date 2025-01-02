import { useEffect, useRef, useState } from "react";
import { Modal } from "rond";

import { getDataOfSetupEntities, type OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds } from "@Src/components";
import type { OptimizerState } from "../ContextProvider/OptimizerProvider";
import type { ArtifactManager } from "./controllers";

import { useStoreSnapshot } from "@Src/features";
import Object_ from "@Src/utils/object-utils";
import { useCharacterData, useOptimizerState } from "../ContextProvider";
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
    <OptimizationFrontDesk
      processing={status.loading}
      optimizer={optimizer}
      onCancelProcess={() => toggle("loading", false)}
      onClose={() => toggle("active", false)}
    />
  ) : null;
}

interface OptimizationFrontDeskProps {
  processing: boolean;
  optimizer: OptimizerState["optimizer"];
  onCancelProcess: () => void;
  onClose: () => void;
}
function OptimizationFrontDesk(props: OptimizationFrontDeskProps) {
  const { optimizer } = props;

  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = calculator.setupsById[calculator.activeId];
    const target = calculator.target;
    const artifacts = userdb.userArts;

    return {
      setup,
      target,
      artifacts,
      data: getDataOfSetupEntities(setup),
    };
  });
  const record = useCharacterData();
  const artifactManager = useArtifactManager(store.artifacts);

  const [activePieceSelect, setActivePieceSelect] = useState(false);
  const [resultStatus, setResultStatus] = useState<"EXIT" | "CLOSE" | "OPEN" | "REOPEN">("CLOSE");
  const [canShowGuideMenu, setCanShowGuideMenu] = useState(false);

  const guideControl = useRef<OptimizationGuideControl<StepKey>>(null);
  const savedValues = useRef<SavedValues>({});
  const setForPieceSelecte = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));
  const lastModConfigs = useRef(artifactManager.allModConfigs);
  const runCount = useRef(0);

  const isActiveResult = resultStatus === "OPEN" || resultStatus === "REOPEN";

  useEffect(() => {
    optimizer.init(store.target, store.setup, store.data);

    const unsubscribe = optimizer.subscribeCompletion(() => {
      runCount.current += 1;
      guideControl.current?.toggle("ACTIVE", false);
      setResultStatus("OPEN");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const optimizeSetup = () => {
    const { calcItem, extraConfigs } = savedValues.current;
    const { allModConfigs } = artifactManager;

    // console.log(artifactManager.sets.filter((set) => set.selectedIds.size));

    optimizer.optimize(
      {
        pattern: calcItem!.patternCate,
        calcItem: calcItem!.value,
        elmtModCtrls: store.setup.elmtModCtrls,
      },
      allModConfigs,
      extraConfigs!
    );

    lastModConfigs.current = Object_.clone(allModConfigs);
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
        const hasAnyNewMod = artifactManager.concludeModConfigs();

        if (newStep !== STEP_KEY.MODIFIERS) {
          guideControl.current?.notify(
            hasAnyNewMod
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
        artifactManager.recordPresentMods();
        break;
    }

    switch (newStep) {
      case STEP_KEY.LAUNCHER: {
        setCanShowGuideMenu(true);

        const { sumary, calcCount, appArtifacts } = artifactManager.sumarize();
        optimizer.load(sumary, appArtifacts, calcCount.value);
        break;
      }
    }
  };

  const stepConfigs: StepConfig<StepKey>[] = [
    {
      key: STEP_KEY.ARTIFACTS,
      title: "Artifacts",
      render: (changeValid) => (
        <ArtifactSetSelect
          artifactManager={artifactManager}
          onChangeValid={changeValid}
          onRequestSelectPieces={(code) => togglePieceSelect(true, code)}
        />
      ),
    },
    {
      key: STEP_KEY.MODIFIERS,
      title: "Artifact Modifiers",
      initialValid: true,
      render: () => <ArtifactModConfig artifactManager={artifactManager} />,
    },
    {
      key: STEP_KEY.CALC_ITEMS,
      title: "Compared Item",
      render: (changeValid) => (
        <CalcItemSelect
          calcList={record.appCharacter.calcList}
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
          artifactManager={artifactManager}
          runCount={runCount.current}
          onRequestLaunch={() => {
            guideControl.current?.notify(null);
            optimizeSetup();
          }}
          onRequestLastResult={() => {
            guideControl.current?.toggle("ACTIVE", false);
            setResultStatus("REOPEN");
          }}
          onCancel={() => {
            optimizer.end();
            optimizer.init(store.target, store.setup, store.data);
            optimizer.load(artifactManager.sumary, artifactManager.appArtifacts, artifactManager.calcCount.value);
            props.onCancelProcess();
          }}
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
          setup={store.setup}
          artifactModConfigs={lastModConfigs.current}
          onRequestReturn={() => {
            setResultStatus("CLOSE");
            guideControl.current?.toggle("ACTIVE", true);
          }}
          onRequestExit={() => setResultStatus("EXIT")}
        />
      </Modal>
    </>
  );
}
