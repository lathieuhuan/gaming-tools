import { useState } from "react";
import { Input, Modal } from "rond";

import type { ValidationError } from "./types";

import { SCREEN_PATH } from "@/constants/config";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import { useRouter } from "@/systems/router";
import Array_ from "@/utils/Array";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { useDispatch } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";
import { validateFreeItemSlots, validateTeammates } from "./utils";

type StoreSnapshot = {
  initialSetupName: string;
  isNewSetup: boolean;
  isError: boolean;
  errors: ValidationError[];
};

type SaveSetupProps = {
  setupId: number;
  onClose: () => void;
};

export function SaveSetup({ setupId, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const setup = useCalcStore(selectSetup);

  const snapshot = useStoreSnapshot<StoreSnapshot>((state) => {
    const existedSetup = Array_.findById(state.userdb.userSetups, setupId);
    const errors = validateFreeItemSlots(state.userdb);

    if (existedSetup) {
      errors.push(...validateTeammates(setup, existedSetup));
    }

    return {
      initialSetupName: existedSetup ? existedSetup.name : `${setup.main.name} setup`,
      isNewSetup: !existedSetup,
      isError: errors.length > 0,
      errors,
    };
  });
  const [input, setInput] = useState(snapshot.initialSetupName);

  const saveSetup = () => {
    dispatch(saveSetupThunk(setup, input));
    router.navigate(SCREEN_PATH.SETUPS);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <p className="mb-2 text-light-hint">
        {snapshot.isNewSetup
          ? "Do you want to save this setup as"
          : "Do you want to update this setup"}
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
