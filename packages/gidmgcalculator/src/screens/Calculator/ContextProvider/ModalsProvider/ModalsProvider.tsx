import { useMemo, useState } from "react";

import { useStore } from "@/lib/dynamic-store";
import { initSessionWithCharacter } from "@Store/calculator/actions";
import { CalculatorModalsContext, CalculatorModalsControl } from "./context";

// Component
import { Tavern } from "@/components/Tavern";
import { TargetConfig } from "./TargetConfig";

type ModalType = "SWITCH_CHARACTER" | "";

export function ModalsProvider(props: { children: React.ReactNode }) {
  const store = useStore();

  const [modalType, setModalType] = useState<ModalType>("");

  const closeModal = () => setModalType("");

  const control: CalculatorModalsControl = useMemo(() => {
    return {
      requestSwitchCharacter: () => {
        setModalType("SWITCH_CHARACTER");
      },
    };
  }, []);

  return (
    <CalculatorModalsContext.Provider value={control}>
      {props.children}

      <TargetConfig />

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
