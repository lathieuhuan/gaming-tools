import { ConfirmModal, Modal } from "rond";

import type { CalcSetup } from "@/models/calculator";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectMySetupModalType, updateUI } from "@Store/ui-slice";
import { removeSetup } from "@Store/userdb-slice";

// Component
import {
  ArtifactCard,
  AttributeTable,
  SetBonusesView,
  SetupExporter,
  WeaponCard,
} from "@/components";
import { Modifiers } from "./Modifiers";

type SetupModalsProps = {
  setupName: string;
  setup: CalcSetup;
};

export function SetupModals({ setupName, setup }: SetupModalsProps) {
  const dispatch = useDispatch();
  const modalType = useSelector(selectMySetupModalType);

  const { weapon, atfGear, totalAttrs } = setup.main;

  const closeModal = () => {
    dispatch(updateUI({ mySetupsModalType: "" }));
  };

  return (
    <>
      <ConfirmModal
        active={modalType === "REMOVE_SETUP"}
        danger
        message={
          <>
            Remove "<b>{setupName}</b>"?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeSetup(setup.ID))}
        onClose={closeModal}
      />

      {/* TODO */}
      {/* <Modal.Core active={modalType === "SHARE_SETUP"} preset="small" onClose={closeModal}>
        <SetupExporter
          setupName={setup.name}
          calcSetup={Setup_.userSetupToCalcSetup(setup, weapon, artifacts)}
          target={setup.target}
          onClose={closeModal}
        />
      </Modal.Core> */}

      <Modal
        active={modalType === "WEAPON"}
        className="bg-dark-1"
        title="Weapon"
        onClose={closeModal}
      >
        <WeaponCard
          wrapperCls="w-76"
          style={{ height: "30rem" }}
          withGutter={false}
          withOwnerLabel
          weapon={weapon}
        />
      </Modal>

      <Modal
        active={modalType === "ARTIFACTS"}
        className="bg-dark-1"
        title="Artifacts"
        onClose={closeModal}
      >
        <div className="flex space-x-1 hide-scrollbar">
          {atfGear.pieces.map((piece, i) => {
            return (
              <ArtifactCard
                key={i}
                wrapperCls="shrink-0"
                className="w-60"
                withGutter={false}
                withOwnerLabel
                artifact={piece}
              />
            );
          })}
        </div>
      </Modal>

      <Modal
        active={modalType === "STATS"}
        className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-1"]}
        title="Stats"
        bodyCls="grow overflow-auto"
        onClose={closeModal}
      >
        <div className="h-full flex hide-scrollbar gap-8">
          <div className="w-76 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Final Attributes</p>
            <div className="mt-1 custom-scrollbar">
              <AttributeTable attributes={totalAttrs} />
            </div>
          </div>

          <div className="w-76 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Artifact Stats</p>
            <div className="mt-1 custom-scrollbar">
              <AttributeTable attributes={atfGear.finalAttrs} />
            </div>
          </div>

          <div className="w-72 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Set bonus</p>
            <div className="grow custom-scrollbar">
              <SetBonusesView noTitle sets={atfGear.sets} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        active={modalType === "MODIFIERS"}
        className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-1"]}
        title="Modifiers"
        bodyCls="grow hide-scrollbar"
        onClose={closeModal}
      >
        <Modifiers setup={setup} />
      </Modal>
    </>
  );
}
