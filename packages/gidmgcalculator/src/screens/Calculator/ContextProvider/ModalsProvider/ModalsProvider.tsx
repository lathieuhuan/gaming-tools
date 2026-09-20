import { useMemo, useState } from "react";
import { Modal } from "rond";

import { useStore } from "@/lib/dynamic-store";
import { initSessionWithCharacter } from "@Store/calculator/actions";
import { CalculatorModalsContext, CalculatorModalsControl } from "./context";

// Component
import { Tavern } from "@/components/Tavern";
import { SaveSetup } from "./SaveSetup";
import { TargetConfig } from "./TargetConfig";

type ModalType = "SWITCH_CHARACTER" | "SAVE_SETUP" | "";

export function ModalsProvider(props: { children: React.ReactNode }) {
  const store = useStore();

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
    };
  }, []);

  return (
    <CalculatorModalsContext.Provider value={control}>
      {props.children}

      <TargetConfig />

      <Modal
        active={modalType === "SAVE_SETUP"}
        preset="small"
        className="bg-dark-1"
        title="Save setup"
        onClose={closeModal}
      >
        <SaveSetup setupId={setupId} onClose={closeModal} />
      </Modal>

      <Tavern
        active={modalType === "SWITCH_CHARACTER"}
        sourceType="mixed"
        onSelectCharacter={(character) => {
          initSessionWithCharacter({
            character: character.userData,
            data: character.data,
            userDb: store.select((state) => state.userdb),
          });
        }}
        onClose={closeModal}
      />
    </CalculatorModalsContext.Provider>
  );
}
