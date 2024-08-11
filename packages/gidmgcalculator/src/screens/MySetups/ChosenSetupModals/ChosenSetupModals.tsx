import { ConfirmModal, Modal } from "rond";
import { GeneralCalc } from "@Backend";

import type { UserArtifacts, UserSetup, UserWeapon } from "@Src/types";
import { Setup_ } from "@Src/utils";
import { calculateChosenSetup } from "../MySetups.utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectMySetupModalType, updateUI } from "@Store/ui-slice";
import { removeSetup } from "@Store/userdb-slice";

// Component
import { ArtifactCard, AttributeTable, SetBonusesView, SetupExporter, WeaponCard } from "@Src/components";
import { ChosenSetupModifiers } from "./ChosenSetupModifiers";

interface ChosenSetupModalsProps {
  chosenSetup: UserSetup;
  weapon?: UserWeapon;
  artifacts: UserArtifacts;
  result?: ReturnType<typeof calculateChosenSetup>;
}
export function ChosenSetupModals({ chosenSetup, weapon, artifacts, result }: ChosenSetupModalsProps) {
  const dispatch = useDispatch();
  const modalType = useSelector(selectMySetupModalType);

  const setBonuses = GeneralCalc.getArtifactSetBonuses(artifacts);

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
            Remove "<b>{chosenSetup.name}</b>"?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeSetup(chosenSetup.ID))}
        onClose={closeModal}
      />

      {weapon && (
        <SetupExporter
          active={modalType === "SHARE_SETUP"}
          setupName={chosenSetup.name}
          calcSetup={Setup_.userSetupToCalcSetup(chosenSetup, weapon, artifacts)}
          target={chosenSetup.target}
          onClose={closeModal}
        />
      )}

      {weapon && (
        <Modal active={modalType === "WEAPON"} className="bg-surface-1" title="Weapon" onClose={closeModal}>
          <WeaponCard wrapperCls="w-76" style={{ height: "30rem" }} withGutter={false} withOwnerLabel weapon={weapon} />
        </Modal>
      )}

      <Modal active={modalType === "ARTIFACTS"} className="bg-surface-1" title="Artifacts" onClose={closeModal}>
        <div className="flex space-x-1 hide-scrollbar">
          {artifacts?.map((artifact, i) => {
            if (artifact) {
              return (
                <ArtifactCard
                  key={i}
                  wrapperCls="shrink-0"
                  className="w-60"
                  withGutter={false}
                  withOwnerLabel
                  artifact={artifact}
                />
              );
            }
            return null;
          })}
        </div>
      </Modal>

      <Modal
        active={modalType === "STATS"}
        className={[Modal.LARGE_HEIGHT_CLS, "bg-surface-1"]}
        title="Stats"
        bodyCls="grow overflow-auto"
        onClose={closeModal}
      >
        <div className="h-full flex hide-scrollbar gap-8">
          <div className="w-76 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Final Attributes</p>
            <div className="mt-1 custom-scrollbar">
              {result?.totalAttr && <AttributeTable attributes={result.totalAttr} />}
            </div>
          </div>

          <div className="w-76 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Artifact Stats</p>
            <div className="mt-1 custom-scrollbar">
              {result?.artAttr && <AttributeTable attributes={result.artAttr} />}
            </div>
          </div>

          <div className="w-72 flex flex-col shrink-0">
            <p className="text-lg text-center font-semibold">Set bonus</p>
            <div className="grow custom-scrollbar">
              <SetBonusesView noTitle setBonuses={setBonuses} />
            </div>
          </div>
        </div>
      </Modal>

      {result && weapon && (
        <Modal
          active={modalType === "MODIFIERS"}
          className={[Modal.LARGE_HEIGHT_CLS, "bg-surface-1"]}
          title="Modifiers"
          bodyCls="grow hide-scrollbar"
          onClose={closeModal}
        >
          <ChosenSetupModifiers {...{ result, chosenSetup, setBonuses, weapon }} />
        </Modal>
      )}
    </>
  );
}
