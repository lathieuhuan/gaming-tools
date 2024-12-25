import { useEffect, useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup, Modal, SwitchNode } from "rond";

import type { OptimizerArtifactBuffConfigs, OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds, ArtifactFilterSet } from "@Src/components";
import type { ArtifactManager } from "./utils/artifact-manager";

import { $AppWeapon } from "@Src/services";
import { useStoreSnapshot } from "@Src/features";
import { useCharacterData, useOptimizerStatus, usePartyData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";
import { useOptimizer } from "./hooks/useOptimizer";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { CalcItemSelect, SelectedCalcItem } from "./components/CalcItemSelect";
import { ExtraConfigs } from "./components/ExtraConfigs";

type StepConfig = {
  title: string;
  formId: string;
};

type SavedValues = {
  calcItem: SelectedCalcItem;
  filterSets: ArtifactFilterSet[];
  setCodes: number[];
  buffConfigs: OptimizerArtifactBuffConfigs;
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

    return {
      setup,
      target,
      artifacts,
    };
  });
  const appChar = useCharacterData();
  const partyData = usePartyData();
  const artifactManager = useArtifactManager(store.artifacts);

  const [activeMain, setActiveMain] = useState(true);
  const [activePieceSelect, setActivePieceSelect] = useState(false);
  const [step, setStep] = useState(0);

  const savedValues = useRef<Partial<SavedValues>>({});
  const selectingSet = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));

  // const optimizer = useOptimizer();

  const STEP_CONFIGS: StepConfig[] = [
    {
      title: "Select Artifacts",
      formId: "artifact-set",
    },
    {
      title: "Artifact Modifier Config",
      formId: "artifact-modifier",
    },
    {
      title: "Select Item",
      formId: "calc-item",
    },
    {
      title: "Extra Config",
      formId: "extra-config",
    },
  ];

  const stepConfig = STEP_CONFIGS[step];

  useEffect(() => {
    const appWeapon = $AppWeapon.get(store.setup.weapon.code)!;
    // optimizer.init(store.target, store.setup, appChar, appWeapon, partyData);
  }, []);

  const optimizeSetup = () => {
    const { calcItem, setCodes, buffConfigs, extraConfigs } = savedValues.current;

    // optimizer.optimize(
    //   {
    //     pattern: calcItem!.patternCate,
    //     calcItem: calcItem!.value,
    //     elmtModCtrls: store.setup.elmtModCtrls,
    //   },
    //   [buffConfigs!, extraConfigs!]
    // );
  };

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= STEP_CONFIGS.length) {
      return optimizeSetup();
    }

    setStep(newStep);
  };

  const saveConfig = <TKey extends keyof SavedValues>(key: TKey, value: SavedValues[TKey]) => {
    savedValues.current[key] = value;
    navigateStep(1);
  };

  const onSubmitArtifactSets = (sets: ArtifactFilterSet[] = []): string | undefined => {
    const setCodes: number[] = [];

    // const newBuffConfig = {
    //   ...savedValues.current.buffConfigs,
    // };

    // for (const { code, data } of sets) {
    //   setCodes.push(code);

    //   if (!newBuffConfig[code] && data.buffs) {
    //     newBuffConfig[code] = data.buffs.map<OptimizerArtifactBuffConfigs[number][number]>((buff) => ({
    //       index: buff.index,
    //       activated: true,
    //       inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true),
    //     }));
    //   }
    // }

    const artifacts = store.artifacts.filter((artifact) => setCodes.includes(artifact.code));
    // const possibleSetCount = optimizer.load(artifacts);

    // console.log("possibleSetCount", possibleSetCount);

    // if (possibleSetCount > 500_000) {
    //   return "To many artifact, please narrow their number down.";
    // } else {
    //   optimizerManager.load(artifacts);
    // }

    return "";

    // savedValues.current.filterSets = sets;
    // savedValues.current.buffConfigs = newBuffConfig;
    saveConfig("setCodes", setCodes);
  };

  const togglePieceSelect = (active: boolean, code?: number) => {
    if (active && code) {
      selectingSet.current = artifactManager.getSet(code);
    }

    setActivePieceSelect(active);
    setActiveMain(!active);
  };

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(selectingSet.current.code, selectedIds);
    togglePieceSelect(false);
  };

  const closeDept = () => {
    setActiveMain(false);
  };

  return (
    <>
      <Modal
        active={activeMain}
        title={<span className="text-lg">Optimization / {stepConfig?.title}</span>}
        style={{
          height: "95vh",
          width: "24rem",
        }}
        className="bg-surface-2"
        bodyCls="py-2"
        closeOnMaskClick={false}
        onClose={closeDept}
        onTransitionEnd={(open) => {
          if (!open && !activePieceSelect) {
            props.onClose();
          }
        }}
      >
        <div className="h-full flex flex-col hide-scrollbar">
          <div className="grow hide-scrollbar">
            <SwitchNode
              value={step}
              cases={[
                {
                  value: 0,
                  element: (
                    <ArtifactSetSelect
                      manager={artifactManager}
                      onRequestSelectPieces={(code) => togglePieceSelect(true, code)}
                    />
                  ),
                },
                {
                  value: 1,
                  element: (
                    <ArtifactModConfig
                      id={stepConfig?.formId}
                      initialValue={{
                        buffs: savedValues.current.buffConfigs,
                      }}
                      artifactSets={savedValues.current.filterSets}
                      onSubmit={(config) => saveConfig("buffConfigs", config.buffs)}
                    />
                  ),
                },
                {
                  value: 2,
                  element: (
                    <CalcItemSelect
                      id={stepConfig?.formId}
                      appChar={appChar}
                      initialValue={savedValues.current?.calcItem}
                      onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
                    />
                  ),
                },
                {
                  value: 3,
                  element: (
                    <ExtraConfigs
                      id={stepConfig?.formId}
                      initialValue={savedValues.current.extraConfigs}
                      onSubmit={(config) => saveConfig("extraConfigs", config)}
                    />
                  ),
                },
              ]}
            />
          </div>

          <ButtonGroup
            className="mt-3 mb-1"
            buttons={[
              {
                children: "Back",
                icon: <FaCaretRight className="text-lg rotate-180" />,
                disabled: !step,
                onClick: () => navigateStep(-1),
              },
              {
                children: "Next",
                icon: <FaCaretRight className="text-lg" />,
                iconPosition: "end",
                // disabled: !stepValids[step],
                form: stepConfig?.formId,
              },
            ]}
          />
        </div>
      </Modal>

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
