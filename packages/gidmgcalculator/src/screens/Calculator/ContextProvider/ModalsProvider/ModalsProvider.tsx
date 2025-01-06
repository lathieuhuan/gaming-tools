import { useMemo, useState } from "react";
import { Modal } from "rond";

import { useDispatch } from "@Store/hooks";
import { initNewSessionWithCharacter } from "@Store/thunks";
import { CalculatorModalsContext, CalculatorModalsControl } from "./Modals.context";

// Component
import { SetupImporter, Tavern } from "@Src/components";
import { CalcSetupExporter } from "./CalcSetupExporter";
import { SaveSetup } from "./SaveSetup";
import { TargetConfig } from "./TargetConfig";
import { OptimizationIntro } from "./OptimizationIntro";

type ModalType = "SWITCH_CHARACTER" | "SAVE_SETUP" | "IMPORT_SETUP" | "SHARE_SETUP" | "OPTIMIZE_INTRO" | "";

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
      requestOptimizer: () => {
        setModalType("OPTIMIZE_INTRO");
      },
    };
  }, []);

  return (
    <CalculatorModalsContext.Provider value={control}>
      {props.children}

      <TargetConfig />

      <Modal
        active={modalType === "OPTIMIZE_INTRO"}
        title="Optimizer"
        preset="small"
        // centered={false}
        className="bg-surface-2"
        // style={{
        //   top: "min(20%, 5rem)",
        // }}
        withActions
        confirmButtonProps={{
          form: OptimizationIntro.FORM_ID,
          type: "submit",
          children: "Proceed",
          autoFocus: true,
        }}
        onClose={closeModal}
      >
        <OptimizationIntro onClose={closeModal} />
      </Modal>

      <Modal
        active={modalType === "SAVE_SETUP"}
        preset="small"
        className="bg-surface-1"
        title="Save setup"
        onClose={closeModal}
      >
        <SaveSetup setupId={setupId} onClose={closeModal} />
      </Modal>

      <SetupImporter active={modalType === "IMPORT_SETUP"} onClose={closeModal} />

      <Modal.Core active={modalType === "SHARE_SETUP"} preset="small" onClose={closeModal}>
        <CalcSetupExporter setupId={setupId} onClose={closeModal} />
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
