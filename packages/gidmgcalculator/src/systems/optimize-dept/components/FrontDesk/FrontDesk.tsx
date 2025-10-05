import { useLayoutEffect, useRef, useState } from "react";
import { ButtonGroup, Checkbox, FancyBackSvg, Modal } from "rond";

import type { OptimizerExtraConfigs } from "@Calculation";
import type { OptimizedOutput } from "@OptimizeDept/logic/OptimizeManager";
import type { OptimizeDeptState } from "@OptimizeDept/types";
import type { OptimizeDeptModalType, OptimizeStepKey, Optimizer } from "./types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import { getSetupAppEntities } from "@/utils/getSetupAppEntities";
import { useArtifactManager } from "@OptimizeDept/hooks";

// Components
import { ItemMultiSelect, type ItemMultiSelectIds } from "@/components";
import { OptimizerOffice } from "../OptimizerOffice";
import { ArtifactModConfig } from "./ArtifactModConfig";
import { ArtifactSetSelect } from "./ArtifactSetSelect";
import { Launcher } from "./Launcher";
import { OnStepChange, OptimizeDeptGuide, StepConfig } from "./OptimizeDeptGuide";
import { OutputSelect } from "./OutputSelect";

type SavedValues = {
  output?: OptimizedOutput;
  extraConfigs: OptimizerExtraConfigs;
};

type SetForPieceSelect = ReturnType<ReturnType<typeof useArtifactManager>["getSet"]>;

export interface FrontDeskProps {
  state: OptimizeDeptState;
  optimizer: Optimizer;
  onCloseDept: (keepResult: boolean) => void;
}
export function FrontDesk({ state, optimizer, onCloseDept }: FrontDeskProps) {
  //
  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = state.setup || calculator.setupsById[calculator.activeId];
    const target = calculator.target;
    const artifacts = userdb.userArts;

    return {
      setup,
      target,
      artifacts,
      data: getSetupAppEntities(setup),
    };
  });
  const artifactManager = useArtifactManager(store.artifacts);

  const [modalType, setModalType] = useState<OptimizeDeptModalType>("GUIDE");
  const [canShowGuideMenu, setCanShowGuideMenu] = useState(false);

  const savedValues = useRef<SavedValues>({
    extraConfigs: {
      preferSet: false,
    },
  });
  const lastModalType = useRef<OptimizeDeptModalType>("");
  const setForPieceSelect = useRef<SetForPieceSelect>(artifactManager.getSet(0));
  const shouldKeepResult = useRef(false);

  const changeModalType = (type: OptimizeDeptModalType) => {
    lastModalType.current = modalType;
    setModalType(type);
  };

  useLayoutEffect(() => {
    optimizer.init(store.target, store.setup, store.data);
  }, []);

  const optimizeSetup = () => {
    const { output, extraConfigs } = savedValues.current;
    const { allModConfigs } = artifactManager;

    if (output) {
      // console.log(artifactManager.sets.filter((set) => set.selectedIds.size));

      optimizer.optimize(
        {
          ...output,
          elmtModCtrls: store.setup.elmtModCtrls,
          infusedElmt: store.setup.customInfusion.element, // this should be configurable in the future
        },
        allModConfigs,
        extraConfigs
      );
    }
  };

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(setForPieceSelect.current.code, selectedIds);
    changeModalType("GUIDE");
  };

  const handleStepChange: OnStepChange<OptimizeStepKey> = (newStep, oldStep, operation) => {
    switch (oldStep) {
      case "ARTIFACT_SELECT": {
        const hasAnyNewMod = artifactManager.concludeModConfigs();

        if (newStep !== "MODIFIER_CONFIG") {
          operation.notify(
            hasAnyNewMod
              ? {
                  message: "New Artifact modifiers configurations!",
                  toStep: "MODIFIER_CONFIG",
                }
              : null
          );
        }
        break;
      }
      case "MODIFIER_CONFIG":
        artifactManager.recordPresentMods();
        break;
    }

    switch (newStep) {
      case "LAUNCH": {
        setCanShowGuideMenu(true);

        const { sumary, calcCount, appArtifacts } = artifactManager.sumarize();
        optimizer.load(sumary, appArtifacts, calcCount.value);
        break;
      }
    }
  };

  const stepConfigs: StepConfig<OptimizeStepKey>[] = [
    {
      key: "ARTIFACT_SELECT",
      title: "Artifacts",
      render: (operation) => (
        <ArtifactSetSelect
          artifactManager={artifactManager}
          onAnySelectedChange={operation.changeValid}
          onSelectPiecesRequested={(code) => {
            setForPieceSelect.current = artifactManager.getSet(code);
            changeModalType("PIECE_SELECT");
          }}
        />
      ),
    },
    {
      key: "MODIFIER_CONFIG",
      title: "Artifact Modifiers",
      initialValid: true,
      render: () => <ArtifactModConfig artifactManager={artifactManager} />,
    },
    {
      key: "OUTPUT_SELECT",
      title: "Optimized Output",
      render: (operation) => (
        <OutputSelect
          calcList={state.calcList}
          initialValue={savedValues.current?.output}
          onChange={(items) => {
            savedValues.current.output = items;
            operation.changeValid(true);
          }}
        />
      ),
    },
    {
      key: "LAUNCH",
      title: "Launching",
      initialValid: true,
      render: (operation) => (
        <Launcher
          artifactManager={artifactManager}
          runCount={state.runCount}
          onLaunch={() => {
            operation.notify(null);
            changeModalType("OPTIMIZER");
            optimizeSetup();
          }}
          onLastResultRequested={() => changeModalType("OPTIMIZER")}
        />
      ),
    },
  ];

  return (
    <>
      <OptimizeDeptGuide
        active={modalType === "GUIDE"}
        stepConfigs={stepConfigs}
        canShowMenu={canShowGuideMenu}
        onStepChange={handleStepChange}
        onClose={() => changeModalType("EXIT_CONFIRM")}
      />

      <ItemMultiSelect
        active={modalType === "PIECE_SELECT"}
        title={<span className="text-lg">Optimizer / Artifacts</span>}
        items={setForPieceSelect.current.artifacts}
        initialValue={setForPieceSelect.current.selectedIds}
        onClose={() => changeModalType("GUIDE")}
        onConfirm={onConfirmSelectPieces}
      />

      <OptimizerOffice
        active={modalType === "OPTIMIZER"}
        closeDeptAfterCloseOffice={modalType === ""}
        moreActions={[
          {
            children: "Return",
            icon: <FancyBackSvg />,
            disabled: state.status === "OPTIMIZING",
            onClick: () => changeModalType("GUIDE"),
          },
        ]}
        onCancel={() => {
          optimizer.init(store.target, store.setup, store.data);
          optimizer.load(artifactManager.sumary, artifactManager.appArtifacts, artifactManager.calcCount.value);
        }}
        onClose={() => changeModalType("")}
        onCloseDept={onCloseDept}
      />

      <Modal.Core
        active={modalType === "EXIT_CONFIRM"}
        className="p-4 bg-dark-2"
        preset="small"
        closeOnEscape={false}
        closeOnMaskClick={false}
        onTransitionEnd={() => {
          if (modalType === "") {
            onCloseDept(shouldKeepResult.current);
          }
        }}
        onClose={() => {}}
      >
        <div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl">Exit the Optimizer?</p>
            {state.result.length ? (
              <Checkbox onChange={(checked) => (shouldKeepResult.current = checked)}>Save the result</Checkbox>
            ) : null}
          </div>

          <ButtonGroup
            className="mt-6"
            buttons={[
              {
                children: "Cancel",
                onClick: () => changeModalType(lastModalType.current),
              },
              {
                children: "Confirm",
                variant: "danger",
                autoFocus: true,
                onClick: () => changeModalType(""),
              },
            ]}
          />
        </div>
      </Modal.Core>
    </>
  );
}
