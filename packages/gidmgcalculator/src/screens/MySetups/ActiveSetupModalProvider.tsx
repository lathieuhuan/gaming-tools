import { ReactNode, useState } from "react";
import { Modal } from "rond";

import type { CalcSetup } from "@/logic/calculator";

import { useDispatch } from "@Store/hooks";
import { removeDbSetup } from "@Store/userdbSlice";
import { SetupModalContext, SetupModalType } from "./contexts/SetupModal";

import { ArtifactCard } from "@/components/ArtifactCard";
import { SETUP_EXPORT_MODAL_PROPS, SetupExporter } from "@/components/SetupPorters";
import { WeaponCard } from "@/components/WeaponCard";
import { CharacterStats } from "./components/CharacterStats";
import { SetupModifiers } from "./components/SetupModifiers";

type ActiveSetupModalProviderProps = {
  children: ReactNode;
  setupName?: string;
  calcSetup?: CalcSetup;
};

export function ActiveSetupModalProvider({
  children,
  setupName = "Setup",
  calcSetup,
}: ActiveSetupModalProviderProps) {
  const dispatch = useDispatch();

  const [modalType, setModalType] = useState<SetupModalType | null>(null);

  if (calcSetup === undefined) {
    return <SetupModalContext.Provider value={setModalType}>{children}</SetupModalContext.Provider>;
  }

  const { main } = calcSetup;

  const closeModal = () => {
    setModalType(null);
  };

  const handleRemoveSetup = () => {
    dispatch(removeDbSetup(calcSetup.ID));
    closeModal();
  };

  return (
    <SetupModalContext.Provider value={setModalType}>
      {children}

      <Modal
        title="Remove setup"
        className="bg-dark-2"
        bodyCls="text-base space-y-2"
        preset="small"
        withActions
        withFooterDivider={false}
        confirmButtonProps={{
          variant: "danger",
        }}
        active={modalType === "REMOVE"}
        onConfirm={handleRemoveSetup}
        onClose={closeModal}
      >
        <p>
          Are you sure you want to remove "<b>{setupName}</b>"?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      <Modal
        title={`Share "${setupName}"`}
        active={modalType === "SHARE"}
        {...SETUP_EXPORT_MODAL_PROPS}
        onClose={closeModal}
      >
        <SetupExporter calcSetup={calcSetup} onCancel={closeModal} />
      </Modal>

      <Modal
        title="Weapon"
        className="bg-dark-1"
        active={modalType === "WEAPON"}
        onClose={closeModal}
      >
        <WeaponCard
          wrapperCls="w-76 h-120"
          withGutter={false}
          withOwnerLabel
          weapon={main.weapon}
        />
      </Modal>

      <Modal
        title="Artifacts"
        className="bg-dark-1"
        active={modalType === "ARTIFACTS"}
        onClose={closeModal}
      >
        <div className="flex space-x-1 hide-scrollbar">
          {main.atfGear.slots((slot) => {
            if (!slot.isFilled) {
              return null;
            }

            return (
              <ArtifactCard
                key={slot.type}
                wrapperCls="shrink-0"
                className="w-60"
                withGutter={false}
                withOwnerLabel
                artifact={slot.piece}
              />
            );
          })}
        </div>
      </Modal>

      <Modal
        title="Stats"
        className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-1"]}
        bodyCls="grow overflow-auto"
        active={modalType === "STATS"}
        onClose={closeModal}
      >
        <CharacterStats className="h-full" character={main} />
      </Modal>

      <Modal
        title="Modifiers"
        className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-1"]}
        bodyCls="grow hide-scrollbar"
        active={modalType === "MODIFIERS"}
        onClose={closeModal}
      >
        <SetupModifiers setup={calcSetup} />
      </Modal>
    </SetupModalContext.Provider>
  );
}
