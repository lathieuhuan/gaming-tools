import { useMemo, useState } from "react";
import { Modal } from "rond";

import { Setup_ } from "@Src/utils";
import { useStoreSnapshot } from "@Src/features";
import { CalculatorModalsContext, type CalculatorModalsControl } from "./calculator-modals-context";

// Component
import { SetupExporterCore, SetupImporter } from "@Src/components";
import { TargetConfig } from "./TargetConfig";
import { SaveSetup } from "./SaveSetup";

type ModalType = "SAVE_SETUP" | "IMPORT_SETUP" | "SHARE_SETUP" | "";

export function CalculatorModalsProvider(props: { children: React.ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>("");
  const [setupId, setSetupId] = useState(0);

  const closeModal = () => setModalType("");

  const control: CalculatorModalsControl = useMemo(() => {
    return {
      requestImportSetup: () => {
        setModalType("IMPORT_SETUP");
      },
      requestSaveSetup: (setupId: number) => {
        setModalType("SAVE_SETUP");
        setSetupId(setupId);
      },
      requestShareSetup: (setupId: number) => {
        setModalType("SHARE_SETUP");
        setSetupId(setupId);
      },
    };
  }, []);

  return (
    <CalculatorModalsContext.Provider value={control}>
      {props.children}

      <TargetConfig />

      <SetupImporter active={modalType === "IMPORT_SETUP"} onClose={closeModal} />

      <Modal
        active={modalType === "SAVE_SETUP"}
        preset="small"
        className="bg-surface-1"
        title="Save setup"
        onClose={closeModal}
      >
        <SaveSetup setupId={setupId} onClose={closeModal} />
      </Modal>

      <Modal.Core active={modalType === "SHARE_SETUP"} preset="small" onClose={closeModal}>
        <CalcSetupExporter setupId={setupId} onClose={closeModal} />
      </Modal.Core>
    </CalculatorModalsContext.Provider>
  );
}

interface CalcSetupExporterProps {
  setupId: number;
  onClose: () => void;
}
function CalcSetupExporter({ setupId, onClose }: CalcSetupExporterProps) {
  const calculator = useStoreSnapshot((state) => state.calculator);
  const setup = calculator.setupsById[setupId];
  const setupName = calculator.setupManageInfos.find((info) => info.ID === setupId)?.name || "";

  return (
    <SetupExporterCore
      setupName={setupName}
      calcSetup={{
        ...Setup_.cleanupCalcSetup(setup, calculator.target),
        weapon: setup.weapon,
        artifacts: setup.artifacts,
      }}
      target={calculator.target}
      onClose={onClose}
    />
  );
}
