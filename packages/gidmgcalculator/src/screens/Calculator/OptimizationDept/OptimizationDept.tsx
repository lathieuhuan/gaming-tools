import { useEffect, useRef, useState } from "react";
import { Modal } from "rond";

import type { OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds } from "@Src/components";
import type { ArtifactManager } from "./utils/artifact-manager";

import { useStoreSnapshot } from "@Src/features";
import { $AppWeapon } from "@Src/services";
import { useCharacterData, useOptimizerState, usePartyData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { CalcItemSelect, SelectedCalcItem } from "./components/CalcItemSelect";
import { ExtraConfigs } from "./components/ExtraConfigs";
import { OptimizationGuide, OptimizationGuideControl, StepConfig } from "./components/OptimizationGuide";
import { Launcher } from "./components/Launcher";
import { ResultDisplay } from "./components/ResultDisplay";
import { OptimizerState } from "../ContextProvider/OptimizerProvider";

type SavedValues = {
  calcItem?: SelectedCalcItem;
  extraConfigs?: OptimizerExtraConfigs;
};

export function OptimizationDept() {
  const { status, optimizer, toggle } = useOptimizerState();

  return status.active ? <OptimizationFrontDesk optimizer={optimizer} onClose={() => toggle("active", false)} /> : null;
}

interface OptimizationFrontDeskProps {
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
  const [activeResult, setActiveResult] = useState(false);
  const [canShowGuideMenu, setCanShowGuideMenu] = useState(false);

  const guideControl = useRef<OptimizationGuideControl>(null);
  const savedValues = useRef<SavedValues>({});
  const selectingSet = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));
  const isExiting = useRef(false);

  useEffect(() => {
    optimizer.init(store.target, store.setup, appChar, store.appWeapon, partyData);

    const unsubscribe = optimizer.subscribeCompletion(() => {
      guideControl.current?.toggle(false);
      setActiveResult(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const optimizeSetup = () => {
    const { calcItem, extraConfigs } = savedValues.current;

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
      selectingSet.current = artifactManager.getSet(code);
    }

    setActivePieceSelect(active);
    guideControl.current?.toggle(!active);
  };

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(selectingSet.current.code, selectedIds);
    togglePieceSelect(false);
  };

  const afterCloseGuide = () => {
    if (!activePieceSelect && !activeResult) {
      props.onClose();
    }
  };

  const stepConfigs: StepConfig[] = [
    {
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
      title: "Artifact Modifiers",
      initialValid: true,
      render: () => <ArtifactModConfig manager={artifactManager} />,
    },
    {
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
    {
      title: "Extra Configurations",
      initialValid: true,
      render: () => (
        <ExtraConfigs
          initialValue={savedValues.current.extraConfigs}
          onChange={(value) => (savedValues.current.extraConfigs = value)}
        />
      ),
    },
    {
      title: "Launcher",
      initialValid: true,
      render: () => <Launcher manager={artifactManager} />,
    },
  ];

  return (
    <>
      <OptimizationGuide
        control={guideControl}
        stepConfigs={stepConfigs}
        canShowMenu={canShowGuideMenu}
        onChangStep={(newStep, oldStep) => {
          if (oldStep === 0) {
            artifactManager.concludeModConfigs();

            if (newStep !== 1 && artifactManager.hasNewSelectedSet) {
              guideControl.current?.notify({
                message: "New Artifact modifiers configurations!",
                toStep: 1,
              });
            }
          }
          if (newStep === 0) {
            artifactManager.recordSelectedSets();
          }
          if (newStep === stepConfigs.length - 1) {
            setCanShowGuideMenu(true);
            optimizer.load(artifactManager.sumarize());
          }
        }}
        onComplete={optimizeSetup}
        afterClose={afterCloseGuide}
      />

      <ItemMultiSelect
        active={activePieceSelect}
        title={<span className="text-lg">Optimize / Select Artifacts</span>}
        items={selectingSet.current.artifacts}
        initialValue={selectingSet.current.selected}
        onClose={() => togglePieceSelect(false)}
        onConfirm={onConfirmSelectPieces}
      />

      <Modal
        active={activeResult}
        title={<span className="text-lg">Optimize / Results</span>}
        className={`bg-surface-2 ${Modal.LARGE_HEIGHT_CLS}`}
        style={{
          width: "45rem",
        }}
        closeOnMaskClick={false}
        withCloseButton={false}
        closeOnEscape={false}
        onClose={() => {}}
        onTransitionEnd={(open) => {
          if (!open && isExiting.current) props.onClose();
        }}
      >
        <ResultDisplay
          onClickReturn={() => {
            isExiting.current = false;
            setActiveResult(false);
            guideControl.current?.toggle(true);
          }}
          onClickExit={() => {
            isExiting.current = true;
            setActiveResult(false);
          }}
          onClickLoadToCalculator={console.log}
        />
      </Modal>
    </>
  );
}
