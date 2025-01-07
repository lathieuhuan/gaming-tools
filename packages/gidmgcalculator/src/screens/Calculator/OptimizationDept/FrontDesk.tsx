import { useEffect, useRef, useState } from "react";
import { ButtonGroup, Checkbox, FancyBackSvg, Modal } from "rond";
import { getDataOfSetupEntities, type OptimizerExtraConfigs } from "@Backend";

import type { ItemMultiSelectIds } from "@Src/components";
import type { OptimizerState } from "../ContextProvider/OptimizerProvider";
import type { ArtifactManager } from "./controllers";
import type {
  OptimizationGuideControl,
  OptimizationModalType,
  OptimizationStepConfig,
  OptimizationStepKey,
  OptimizedOutput,
} from "./OptimizationDept.types";

import { useStoreSnapshot } from "@Src/features";
import Object_ from "@Src/utils/object-utils";
import { useCharacterData } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { OptimizationGuide } from "./components/OptimizationGuide";
import { OutputSelect } from "./components/OutputSelect";
// import { ExtraConfigs } from "./components/ExtraConfigs";
import { Launcher } from "./components/Launcher";
import { ResultDisplay } from "./components/ResultDisplay";

type SavedValues = {
  output?: OptimizedOutput;
  extraConfigs: OptimizerExtraConfigs;
};

interface OptimizationFrontDeskProps {
  state: OptimizerState;
}
export function OptimizationFrontDesk(props: OptimizationFrontDeskProps) {
  const { status, optimizer, close: closeDept, setLoading } = props.state;

  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = status.setup || calculator.setupsById[calculator.activeId];
    const target = calculator.target;
    const artifacts = userdb.userArts;

    return {
      setup,
      manageInfos: calculator.setupManageInfos,
      target,
      artifacts,
      data: getDataOfSetupEntities(setup),
    };
  });
  const record = useCharacterData();
  const artifactManager = useArtifactManager(store.artifacts);

  const [modalType, setModalType] = useState<OptimizationModalType>("GUIDE");
  const [canShowGuideMenu, setCanShowGuideMenu] = useState(false);

  const guideControl = useRef<OptimizationGuideControl>(null);
  const savedValues = useRef<SavedValues>({
    extraConfigs: {
      preferSet: false,
    },
  });
  const lastModalType = useRef<OptimizationModalType>("");
  const lastModConfigs = useRef(artifactManager.allModConfigs);
  const setForPieceSelect = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));
  const shouldKeepResult = useRef(false);
  const runCount = useRef(0);

  const changeModalType = (type: OptimizationModalType) => {
    lastModalType.current = modalType;
    setModalType(type);
  };

  useEffect(() => {
    optimizer.init(store.target, store.setup, store.data);

    const unsubscribe = optimizer.subscribeCompletion(() => {
      runCount.current += 1;
      changeModalType("RESULT");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const optimizeSetup = () => {
    const { output, extraConfigs } = savedValues.current;
    const { allModConfigs } = artifactManager;

    if (output) {
      // console.log(artifactManager.sets.filter((set) => set.selectedIds.size));

      optimizer.optimize(
        {
          pattern: output.attPatt,
          calcItem: output.item,
          elmtModCtrls: store.setup.elmtModCtrls,
          infusedElmt: store.setup.customInfusion.element, // this should be configurable in the future
        },
        allModConfigs,
        extraConfigs
      );

      lastModConfigs.current = Object_.clone(allModConfigs);
    }
  };

  const afterCloseTerminalModal = () => {
    if (modalType === "") {
      closeDept(shouldKeepResult.current);
    }
  };

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(setForPieceSelect.current.code, selectedIds);
    changeModalType("GUIDE");
  };

  const onChangStep = (newStep: OptimizationStepKey, oldStep: OptimizationStepKey) => {
    switch (oldStep) {
      case "ARTIFACT_SELECT": {
        const hasAnyNewMod = artifactManager.concludeModConfigs();

        if (newStep !== "MODIFIER_CONFIG") {
          guideControl.current?.notify(
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

  const stepConfigs: OptimizationStepConfig[] = [
    {
      key: "ARTIFACT_SELECT",
      title: "Artifacts",
      render: (changeValid) => (
        <ArtifactSetSelect
          artifactManager={artifactManager}
          onChangeValid={changeValid}
          onRequestSelectPieces={(code) => {
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
      render: (changeValid) => (
        <OutputSelect
          calcList={record.appCharacter.calcList}
          initialValue={savedValues.current?.output}
          onChange={(items) => (savedValues.current.output = items)}
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
      key: "LAUNCH",
      title: "Launching",
      initialValid: true,
      render: () => (
        <Launcher
          artifactManager={artifactManager}
          runCount={runCount.current}
          onRequestLaunch={() => {
            guideControl.current?.notify(null);
            optimizeSetup();
          }}
          onRequestLastResult={() => changeModalType("RESULT")}
          onCancel={() => {
            optimizer.end();
            optimizer.init(store.target, store.setup, store.data);
            optimizer.load(artifactManager.sumary, artifactManager.appArtifacts, artifactManager.calcCount.value);
            setLoading(false);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <OptimizationGuide
        active={modalType === "GUIDE"}
        control={guideControl}
        stepConfigs={stepConfigs}
        canShowMenu={canShowGuideMenu}
        processing={status.loading}
        onChangStep={onChangStep}
        onClose={() => changeModalType("EXIT_CONFIRM")}
      />

      <ItemMultiSelect
        active={modalType === "PIECE_SELECT"}
        title={<span className="text-lg">Optimizer / Select Artifacts</span>}
        items={setForPieceSelect.current.artifacts}
        initialValue={setForPieceSelect.current.selectedIds}
        onClose={() => changeModalType("GUIDE")}
        onConfirm={onConfirmSelectPieces}
      />

      <ResultDisplay
        active={modalType === "RESULT"}
        // setup={store.setup}
        // artifactModConfigs={lastModConfigs.current}
        moreActions={[
          {
            children: "Return",
            icon: <FancyBackSvg />,
            onClick: () => changeModalType("GUIDE"),
          },
        ]}
        onClose={() => changeModalType("")}
        afterClose={(shouldKeepResult) => {
          if (modalType === "") {
            closeDept(shouldKeepResult);
          }
        }}
      />

      <Modal.Core
        active={modalType === "EXIT_CONFIRM"}
        className="p-4 bg-surface-2"
        preset="small"
        closeOnEscape={false}
        closeOnMaskClick={false}
        onTransitionEnd={afterCloseTerminalModal}
        onClose={() => {}}
      >
        <div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl">Exit the Optimizer?</p>
            {status.result.length ? (
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
