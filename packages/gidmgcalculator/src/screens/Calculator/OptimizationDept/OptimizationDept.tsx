import { useEffect, useRef, useState } from "react";
import { ButtonGroup, Checkbox, Modal } from "rond";

import { getDataOfSetupEntities, type OptimizerExtraConfigs } from "@Backend";
import type { ItemMultiSelectIds } from "@Src/components";
import type { CalcSetup } from "@Src/types";
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
import { useCharacterData, useOptimizerState } from "../ContextProvider";
import { useArtifactManager } from "./hooks/useArtifactManager";

// Components
import { ItemMultiSelect } from "@Src/components";
import { ArtifactModConfig } from "./components/ArtifactModConfig";
import { ArtifactSetSelect } from "./components/ArtifactSetSelect";
import { OutputSelect } from "./components/OutputSelect";
import { OptimizationGuide } from "./components/OptimizationGuide";
// import { ExtraConfigs } from "./components/ExtraConfigs";
import { Launcher } from "./components/Launcher";
import { ResultDisplay } from "./components/ResultDisplay";

type SavedValues = {
  output?: OptimizedOutput;
  extraConfigs: OptimizerExtraConfigs;
};

const MAX_SETUPS = 5;

export function OptimizationDept() {
  const { status, optimizer, setActive, setLoading } = useOptimizerState();

  return status.active ? (
    <OptimizationFrontDesk
      processing={status.loading}
      setup={status.setup}
      optimizer={optimizer}
      onCancelProcess={() => setLoading(false)}
      onClose={() => setActive(false)}
    />
  ) : null;
}

interface OptimizationFrontDeskProps {
  processing: boolean;
  setup?: CalcSetup;
  optimizer: OptimizerState["optimizer"];
  onCancelProcess: () => void;
  onClose: () => void;
}
function OptimizationFrontDesk(props: OptimizationFrontDeskProps) {
  const { optimizer } = props;

  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = props.setup || calculator.setupsById[calculator.activeId];
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
  const lastModalType = useRef<OptimizationModalType>("");
  const savedValues = useRef<SavedValues>({
    extraConfigs: {
      preferSet: false,
    },
  });
  const setForPieceSelecte = useRef<ReturnType<ArtifactManager["getSet"]>>(artifactManager.getSet(0));
  const lastModConfigs = useRef(artifactManager.allModConfigs);
  const runCount = useRef(0);

  console.log(modalType);

  const afterCloseModal = () => {
    if (modalType === "") props.onClose();
  };

  useEffect(() => {
    optimizer.init(store.target, store.setup, store.data);

    const unsubscribe = optimizer.subscribeCompletion(() => {
      runCount.current += 1;
      setModalType("RESULT");
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

  const onConfirmSelectPieces = (selectedIds: ItemMultiSelectIds) => {
    artifactManager.updateSelectedIds(setForPieceSelecte.current.code, selectedIds);
    setModalType("GUIDE");
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

  const onLoadResultToCalculator = (indexes: number[]) => {
    if (store.manageInfos.length + indexes.length > MAX_SETUPS) {
      //
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
            setForPieceSelecte.current = artifactManager.getSet(code);
            setModalType("PIECE_SELECT");
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
          onRequestLastResult={() => setModalType("RESULT")}
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
        active={modalType === "GUIDE"}
        control={guideControl}
        stepConfigs={stepConfigs}
        canShowMenu={canShowGuideMenu}
        frozen={props.processing}
        onChangStep={onChangStep}
        onClose={() => setModalType("EXIT_CONFIRM")}
        afterClose={afterCloseModal}
      />

      <ItemMultiSelect
        active={modalType === "PIECE_SELECT"}
        title={<span className="text-lg">Optimizer / Select Artifacts</span>}
        items={setForPieceSelecte.current.artifacts}
        initialValue={setForPieceSelecte.current.selectedIds}
        onClose={() => setModalType("GUIDE")}
        onConfirm={onConfirmSelectPieces}
      />

      <Modal
        active={modalType === "RESULT"}
        title={<span className="text-lg">Optimizer / Result</span>}
        className={`bg-surface-2 ${Modal.LARGE_HEIGHT_CLS}`}
        style={{
          width: "45rem",
        }}
        closeOnMaskClick={false}
        withCloseButton={false}
        closeOnEscape={false}
        onClose={() => {}}
        onTransitionEnd={afterCloseModal}
      >
        <ResultDisplay
          // setup={store.setup}
          // artifactModConfigs={lastModConfigs.current}
          onRequestReturn={() => setModalType("GUIDE")}
          onRequestExit={() => setModalType("EXIT_CONFIRM")}
          onRequestLoadToCalculator={onLoadResultToCalculator}
        />
      </Modal>

      <Modal
        active={modalType === "EXIT_CONFIRM"}
        onTransitionEnd={afterCloseModal}
        onConfirm={() => setModalType("")}
        onClose={() => {}}
      >
        <div>
          <p>Exit the Optimizer?</p>
          <div>
            <Checkbox>Save the result</Checkbox>
          </div>

          <ButtonGroup
            buttons={[
              {
                children: "Cancel",
                onClick: () => setModalType(lastModalType.current),
              },
              {
                children: "Confirm",
                onClick: () => setModalType(""),
              },
            ]}
          />
        </div>
      </Modal>
    </>
  );
}
