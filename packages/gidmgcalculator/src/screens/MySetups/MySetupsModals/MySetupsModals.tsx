import { FaUnlink, FaWrench } from "react-icons/fa";
import { Modal } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectMySetupModalType, updateUI } from "@Store/ui-slice";

// Component
import { markYellow } from "@/components";
import FirstCombine from "./FirstCombine";
import CombineMore from "./CombineMore";

type MySetupsModalsProps = {
  combineMoreId?: number;
};

export function MySetupsModals(props: MySetupsModalsProps) {
  const dispatch = useDispatch();
  const modalType = useSelector(selectMySetupModalType);

  const closeModal = () => {
    dispatch(updateUI({ mySetupsModalType: "" }));
  };

  return (
    <>
      <Modal
        active={modalType === "TIPS"}
        title="Tips"
        preset="large"
        bodyCls="grow custom-scrollbar"
        {...props}
        onClose={closeModal}
      >
        <ul className="pl-4 pr-2 list-disc space-y-1 contains-inline-svg">
          <li>
            {markYellow("Update setups")}: When you press <FaWrench /> on a saved setup, you're
            pushing a <span className="text-danger-2">copy</span> of it to the Calculator, so don't
            forget to save the modified copy if you want to apply the changes to that setup.
          </li>
          <li>
            {markYellow("Teammate details")} on a setup can be viewed when you press a teammate
            icon. Here you can build a setup for that teammate based on the main setup. Party
            members and Target will be the same. Some modifiers will remain activated and keep their
            inputs.
          </li>
          <li>
            {markYellow("Complex Setup")} is the result of combining setups of the same 4 party
            members. You can break this complex into individual setups again by pressing the{" "}
            <FaUnlink /> before its name. Now at teammate details you can switch to that setup.
          </li>
          <li>
            You CANNOT change teammates when modifying the direct copy of a setup that is in a
            complex. However you can make a copy of that copy in the Calculator and work on it.
          </li>
        </ul>
      </Modal>

      <Modal
        active={modalType === "FIRST_COMBINE"}
        title="Combine setups"
        className="bg-dark-2"
        bodyCls="grow hide-scrollbar"
        withActions
        style={{
          minWidth: 300,
          height: "90vh",
          maxHeight: 1024,
        }}
        formId="setup-combine"
        onClose={closeModal}
      >
        <FirstCombine onClose={closeModal} />
      </Modal>

      <Modal
        active={modalType === "COMBINE_MORE"}
        title="Add setups to the complex"
        className="bg-dark-2"
        bodyCls="grow hide-scrollbar"
        withActions
        style={{
          minWidth: 300,
          height: "90vh",
          maxHeight: 1024,
        }}
        formId="setup-combine-more"
        onClose={closeModal}
      >
        {props.combineMoreId && <CombineMore setupID={props.combineMoreId} onClose={closeModal} />}
      </Modal>
    </>
  );
}
