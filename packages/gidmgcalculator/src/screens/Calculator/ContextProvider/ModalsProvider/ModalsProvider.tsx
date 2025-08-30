import { useMemo, useState } from "react";
import { Modal } from "rond";

import { useDispatch } from "@Store/hooks";
import { initNewSessionWithCharacter } from "@Store/thunks";
import { CalculatorModalsContext, CalculatorModalsControl } from "./context";

// Component
import { Tavern } from "@Src/components";
import { SaveSetup } from "./SaveSetup";
import { SetupExportGate } from "./SetupExportGate";
import { SetupImportGate } from "./SetupImportGate";
import { TargetConfig } from "./TargetConfig";

type ModalType = "SWITCH_CHARACTER" | "SAVE_SETUP" | "IMPORT_SETUP" | "SHARE_SETUP" | "";

export function ModalsProvider(props: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");
  const [setupId, setSetupId] = useState(0);

  const closeModal = () => setModalType("");

  const control: CalculatorModalsControl = useMemo(() => {
    return {
      requestSwitchCharacter: () => {
        setModalType("SWITCH_CHARACTER");
      },
      requestSaveSetup: (setupId) => {
        setModalType("SAVE_SETUP");
        setSetupId(setupId);
      },
      requestImportSetup: () => {
        setModalType("IMPORT_SETUP");
      },
      requestShareSetup: (setupId) => {
        setModalType("SHARE_SETUP");
        setSetupId(setupId);
      },
    };
  }, []);

  return (
    <CalculatorModalsContext.Provider value={control}>
      {props.children}

      <TargetConfig />

      <Modal
        active={modalType === "SAVE_SETUP"}
        preset="small"
        className="bg-surface-1"
        title="Save setup"
        onClose={closeModal}
      >
        <SaveSetup setupId={setupId} onClose={closeModal} />
      </Modal>

      <Modal.Core active={modalType === "IMPORT_SETUP"} preset="small" onClose={closeModal}>
        <SetupImportGate onClose={closeModal} />
      </Modal.Core>

      <Modal.Core active={modalType === "SHARE_SETUP"} preset="small" onClose={closeModal}>
        <SetupExportGate setupId={setupId} onClose={closeModal} />
      </Modal.Core>

      <Tavern
        active={modalType === "SWITCH_CHARACTER"}
        sourceType="mixed"
        onSelectCharacter={(character) => {
          dispatch(initNewSessionWithCharacter(character));
        }}
        onClose={closeModal}
      />
    </CalculatorModalsContext.Provider>
  );
}
