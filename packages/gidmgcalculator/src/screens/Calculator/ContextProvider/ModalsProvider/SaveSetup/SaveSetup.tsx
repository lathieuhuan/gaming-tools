import { useState } from "react";
import { Input, Modal } from "rond";

import type { ValidationError } from "./types";

import { SCREEN_PATH } from "@Src/app/config";
import { useStoreSnapshot } from "@Src/features";
import { useRouter } from "@Src/systems/router";
import Array_ from "@Src/utils/array-utils";
import { useDispatch } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";
import { validateFreeItemSlots, validateTeammates } from "./utils";

type StoreSnapshot = {
  initialSetupName: string;
  isNewSetup: boolean;
  isError: boolean;
  errors: ValidationError[];
};

interface SaveSetupProps {
  setupId: number;
  onClose: () => void;
}
export function SaveSetup({ setupId, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const snapshot = useStoreSnapshot<StoreSnapshot>((state) => {
    const existedSetup = Array_.findById(state.userdb.userSetups, setupId);
    const setup = state.calculator.setupsById[setupId];
    const errors = validateFreeItemSlots(state.userdb);

    if (existedSetup) {
      errors.push(...validateTeammates(setup, existedSetup));
    }

    return {
      initialSetupName: existedSetup ? existedSetup.name : `${setup.char.name} setup`,
      isNewSetup: !existedSetup,
      isError: errors.length > 0,
      errors,
    };
  });
  const [input, setInput] = useState(snapshot.initialSetupName);

  const saveSetup = () => {
    dispatch(saveSetupThunk(setupId, input));
    router.navigate(SCREEN_PATH.SETUPS);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <p className="mb-2 text-hint-color">
        {snapshot.isNewSetup ? "Do you want to save this setup as" : "Do you want to update this setup"}
      </p>
      <Input
        className="text-center font-semibold"
        size="large"
        autoFocus
        value={input}
        maxLength={34}
        onChange={setInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveSetup();
          }
        }}
      />

      <ul className="mt-4 pl-4 text-sm text-danger-2 list-disc space-y-1">
        {snapshot.errors.map((error) => (
          <li key={error.code}>{error.message}</li>
        ))}
      </ul>

      <Modal.Actions
        className="mt-4"
        withDivider
        disabledConfirm={snapshot.isError}
        onCancel={onClose}
        onConfirm={saveSetup}
      />
    </div>
  );
}
