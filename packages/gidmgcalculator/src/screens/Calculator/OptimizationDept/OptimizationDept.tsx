import { useEffect, useRef, useState } from "react";

import type { OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds } from "@Src/components";
import type { ArtifactManager } from "./utils/artifact-manager";

import { useStoreSnapshot } from "@Src/features";
import { $AppWeapon } from "@Src/services";
import { useCharacterData, useOptimizerStatus, usePartyData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";
import { useOptimizer } from "./hooks/useOptimizer";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { CalcItemSelect, SelectedCalcItem } from "./components/CalcItemSelect";
import { ExtraConfigs } from "./components/ExtraConfigs";
import { OptimizationGuide, OptimizationGuideControl, StepConfig } from "./components/OptimizationGuide";
import { Review } from "./components/Review";

type SavedValues = {
  calcItem: SelectedCalcItem;
  extraConfigs: OptimizerExtraConfigs;
};

export function OptimizationDept() {
  const { value: status, toggle } = useOptimizerStatus();

  return status.active ? <OptimizerFrontDesk onClose={() => toggle(false)} /> : null;
}

interface OptimizerFrontDeskProps {
  onClose: () => void;
}
function OptimizerFrontDesk(props: OptimizerFrontDeskProps) {
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

  const guideControl = useRef<OptimizationGuideControl>(null);
  const savedValues = useRef<Partial<SavedValues>>({});
  const selectingSet = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));

  const optimizer = useOptimizer(store.target, store.setup, appChar, store.appWeapon, partyData);

  // useEffect(() => {
  //   const appWeapon = $AppWeapon.get(store.setup.weapon.code)!;
  //   optimizer.init(store.target, store.setup, appChar, appWeapon, partyData);
  // }, []);

  useEffect(() => {
    return () => {
      optimizer.end();
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
      title: "Review",
      initialValid: true,
      render: () => <Review manager={artifactManager} />,
    },
  ];

  return (
    <>
      <OptimizationGuide
        control={guideControl}
        stepConfigs={stepConfigs}
        onChangStep={(newStep, oldStep) => {
          if (oldStep === 0 && newStep === 1) {
            artifactManager.concludeModConfigs();
          }
          if (newStep === stepConfigs.length - 1) {
            optimizer.load(artifactManager.sumarize());
          }
        }}
        onComplete={optimizeSetup}
        afterClose={() => {
          if (!activePieceSelect) {
            props.onClose();
          }
        }}
      />

      <ItemMultiSelect
        active={activePieceSelect}
        title={<span className="text-lg">Optimization / Select Artifacts</span>}
        items={selectingSet.current.artifacts}
        initialValue={selectingSet.current.selected}
        onClose={() => togglePieceSelect(false)}
        onConfirm={onConfirmSelectPieces}
      />
    </>
  );
}
