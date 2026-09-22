import { Button, TrashCanSvg } from "rond";

import { useDispatch } from "@Store/hooks";
import { removeDbSetup } from "@Store/userdbSlice";

// Component
import { ModalAction } from "@/components/ModalAction";

type RemoveSetupButtonProps = {
  setupID: number;
  setupName: string;
};

export function RemoveSetupButton({ setupID, setupName }: RemoveSetupButtonProps) {
  const dispatch = useDispatch();

  return (
    <ModalAction
      title="Remove setup"
      className="bg-dark-2"
      preset="small"
      content={
        <div className="text-base space-y-2">
          <p>
            Are you sure you want to remove "<b>{setupName}</b>"?
          </p>
          <p>This action cannot be undone.</p>
        </div>
      }
      withActions
      withFooterDivider={false}
      confirmButtonProps={{
        variant: "danger",
      }}
      onTransitionEnd={(open) => {
        if (!open) {
          dispatch(removeDbSetup(setupID));
        }
      }}
      // onConfirm={() => dispatch(removeDbSetup(setupID))}
    >
      <Button icon={<TrashCanSvg />} />
    </ModalAction>
  );
}
