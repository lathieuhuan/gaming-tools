import { useEffect, useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup, Modal, SwitchNode } from "rond";

import type { OptimizerArtifactBuffConfigs, OptimizerExtraConfigs } from "@Backend";
import type { ArtifactFilterSet } from "@Src/components";

import { $AppWeapon } from "@Src/services";
import { useStoreSnapshot } from "@Src/features";
import { useCharacterData, useOptimizerStatus, usePartyData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";
import { useOptimizer } from "./hooks/useOptimizer";

// Components
import { ArtifactModConfig } from "./ArtifactModConfig";
import { ArtifactSetSelect } from "./ArtifactSetSelect";
import { CalcItemSelect, SelectedCalcItem } from "./CalcItemSelect";
import { ExtraConfigs } from "./ExtraConfigs";

type SavedValues = {
  calcItem: SelectedCalcItem;
  filterSets: ArtifactFilterSet[];
  setCodes: number[];
  buffConfigs: OptimizerArtifactBuffConfigs;
  extraConfigs: OptimizerExtraConfigs;
};

export function OptimizationDept() {
  const { value: status } = useOptimizerStatus();
  return status.active ? <OptimizerFrontDesk /> : null;
}

function OptimizerFrontDesk() {
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

  const savedValues = useRef<Partial<SavedValues>>({});
  const [step, setStep] = useState(0);

  const artifactManager = useArtifactManager(store.artifacts);
  const optimizer = useOptimizer();

  const FORM_IDS = ["artifact-set", "artifact-modifier", "calc-item", "extra-config"];
  const currentFormId = FORM_IDS[step];

  useEffect(() => {
    const appWeapon = $AppWeapon.get(store.setup.weapon.code)!;
    optimizer.init(store.target, store.setup, appChar, appWeapon, partyData);
  }, []);

  const optimizeSetup = () => {
    const { calcItem, setCodes, buffConfigs, extraConfigs } = savedValues.current;

    optimizer.optimize(
      {
        pattern: calcItem!.patternCate,
        calcItem: calcItem!.value,
        elmtModCtrls: store.setup.elmtModCtrls,
      },
      [buffConfigs!, extraConfigs!]
    );
  };

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= FORM_IDS.length) {
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

  return (
    <Modal
      active
      title="Optimization"
      preset="small"
      className="bg-surface-2"
      bodyCls="py-2"
      closeOnMaskClick={false}
      onClose={() => setStep(-1)}
    >
      <div className="h-full flex flex-col hide-scrollbar" style={{ height: "80vh" }}>
        <div className="grow hide-scrollbar">
          <SwitchNode
            value={step}
            cases={[
              {
                value: 0,
                element: (
                  <ArtifactSetSelect
                    id={currentFormId}
                    manager={artifactManager}
                    onSubmit={() => onSubmitArtifactSets()}
                  />
                ),
              },
              {
                value: 1,
                element: (
                  <ArtifactModConfig
                    id={currentFormId}
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
                    id={currentFormId}
                    initialValue={savedValues.current?.calcItem}
                    onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
                  />
                ),
              },
              {
                value: 3,
                element: (
                  <ExtraConfigs
                    id={currentFormId}
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
              type: "submit",
              children: "Next",
              icon: <FaCaretRight className="text-lg" />,
              iconPosition: "end",
              // disabled: !stepValids[step],
              form: FORM_IDS[step],
            },
          ]}
        />
      </div>
    </Modal>
  );
}
