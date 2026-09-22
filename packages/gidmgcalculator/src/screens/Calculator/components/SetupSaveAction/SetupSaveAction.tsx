import { useId } from "react";
import { Array_ } from "ron-utils";
import { ExactOmit, ExclamationCircleSvg, Modal } from "rond";

import type { CalcSetup } from "@/logic/calculator";

import { useStoreSnapshot } from "@/lib/dynamic-store";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { validateFreeItemSlots, validateTeammates, ValidationError } from "./logic";

import { ModalAction, ModalActionProps } from "@/components/ModalAction";
import { SetupSaveForm } from "./SetupSaveForm";

type State = {
  setup: CalcSetup | null;
  initialSetupName: string;
  isNewSetup: boolean;
  isError: boolean;
  errors: ValidationError[];
};

type SetupSaveActionProps = ExactOmit<ModalActionProps, "content"> & {
  setupId: number;
};

export function SetupSaveAction({ setupId, ...props }: SetupSaveActionProps) {
  return (
    <ModalAction
      title="Save setup"
      preset="small"
      className="bg-dark-1"
      content={(_, setOpen) => <SetupSave setupId={setupId} onCancel={() => setOpen(false)} />}
      {...props}
    />
  );
}

type SetupSaveProps = {
  setupId: number;
  onCancel: () => void;
};

function SetupSave({ setupId, onCancel }: SetupSaveProps) {
  const formId = useId();
  const setup = useCalcStore(selectSetup);

  const snapshot = useStoreSnapshot<Omit<State, "setup">>((state) => {
    const existedSetup = Array_.findById(state.userdb.userSetups, setupId);
    const errors = validateFreeItemSlots(state.userdb);

    if (existedSetup) {
      errors.push(...validateTeammates(setup, existedSetup));
    }

    return {
      initialSetupName: existedSetup?.name || `${setup.main.data.name} setup`,
      isNewSetup: !existedSetup,
      isError: errors.length > 0,
      errors,
    };
  });

  if (snapshot.isError) {
    return (
      <div>
        <div className="text-lg text-danger-2 flex items-center gap-2">
          <ExclamationCircleSvg />
          <span className="font-semibold">Cannot save setup.</span>
        </div>
        <ul className="mt-2 pl-4 text-sm list-disc space-y-1">
          {snapshot.errors.map((error) => (
            <li key={error.code}>{error.message}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <SetupSaveForm
        id={formId}
        setup={setup}
        isNewSetup={snapshot.isNewSetup}
        initialName={snapshot.initialSetupName}
        onFinish={onCancel}
      />

      <Modal.Actions
        className="mt-4"
        confirmButtonProps={{ type: "submit", form: formId }}
        onCancel={onCancel}
      />
    </div>
  );
}
