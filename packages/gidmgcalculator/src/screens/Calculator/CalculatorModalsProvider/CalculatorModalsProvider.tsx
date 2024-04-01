import { useMemo, useState } from "react";
import { Modal } from "rond";

import { Setup_ } from "@Src/utils";
import { useStore } from "@Src/features";
import { CalculatorModalsContext, type CalculatorModalsControl } from "./calculator-modals-context";

// Component
import { SetupExporterCore, SetupImporter } from "@Src/components";
import { TargetConfig } from "./TargetConfig";
import { SaveSetup } from "./SaveSetup";

type ModalType = "SAVE_SETUP" | "IMPORT_SETUP" | "SHARE_SETUP" | "";

export function CalculatorModalsProvider(props: { children: React.ReactNode }) {
  const store = useStore();
  const [modalType, setModalType] = useState<ModalType>("");
  const [setupId, setSetupId] = useState(0);

  const closeModal = () => setModalType("");

  const control: CalculatorModalsControl = useMemo(() => {
    const requestImportSetup = () => {
      setModalType("IMPORT_SETUP");
    };

    const requestSaveSetup = (setupId: number) => {
      setModalType("SAVE_SETUP");
      setSetupId(setupId);
    };

    const requestShareSetup = (setupId: number) => {
      setModalType("SHARE_SETUP");
      setSetupId(setupId);
    };

    return {
      requestImportSetup,
      requestSaveSetup,
      requestShareSetup,
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
        {() => {
          const calculator = store.select((state) => state.calculator);
          const name = calculator.setupManageInfos.find((info) => info.ID === setupId)?.name || "";

          return (
            <SetupExporterCore
              setupName={name}
              calcSetup={{
                ...Setup_.cleanupCalcSetup(calculator, setupId),
                weapon: calculator.setupsById[setupId].weapon,
                artifacts: calculator.setupsById[setupId].artifacts,
              }}
              target={calculator.target}
              onClose={closeModal}
            />
          );
        }}
      </Modal.Core>
    </CalculatorModalsContext.Provider>
  );
}
