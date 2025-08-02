import { useState } from "react";
import { Input, Modal } from "rond";

import { useStoreSnapshot } from "@Src/features";
import type { Teammates } from "@Src/types";
import Array_ from "@Src/utils/array-utils";
import Setup_ from "@Src/utils/setup-utils";

// Store
import { useDispatch } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";

function areDifferentTeammates(teammates1: Teammates, teammates2: Teammates) {
  const team1 = Array_.truthy(teammates1);
  const team2 = Array_.truthy(teammates2);
  return team1.length !== team2.length || team1.some((t1) => team2.every((t2) => t2.name !== t1.name));
}

type ProcessedResult = {
  initialSetupName: string;
  isEligible: boolean;
  isNewSetup: boolean;
};

interface SaveSetupProps {
  setupId: number;
  onClose: () => void;
}
export function SaveSetup({ setupId, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();

  const snapshot = useStoreSnapshot<ProcessedResult>((state) => {
    const existedSetup = Array_.findById(state.userdb.userSetups, setupId);
    const setup = state.calculator.setupsById[setupId];

    if (
      existedSetup &&
      Setup_.isUserSetup(existedSetup) &&
      existedSetup.type === "combined" &&
      areDifferentTeammates(existedSetup.party, setup.party)
    ) {
      return {
        initialSetupName: existedSetup.name,
        isEligible: false,
        isNewSetup: false,
      };
    }

    return {
      initialSetupName: existedSetup ? existedSetup.name : `${setup.char.name} setup`,
      isEligible: true,
      isNewSetup: !existedSetup,
    };
  });
  const [input, setInput] = useState(snapshot.initialSetupName);

  if (snapshot.isEligible) {
    return (
      <div className="space-y-2">
        <p className="text-lg text-danger-2">Not eligible for update</p>
        <p>This setup is currently in a complex. Please ensure it's party members remain the same before updating.</p>
        <Modal.Actions showCancel={false} focusConfirm onConfirm={onClose} />
      </div>
    );
  }

  const saveSetup = () => {
    dispatch(saveSetupThunk(setupId, input));
    onClose();
  };

  return (
    <>
      <div className="flex flex-col">
        <p className="mb-2 text-hint-color">
          {snapshot.isNewSetup ? "Do you what to save this setup as" : "Do you what to update this setup"}
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
        <Modal.Actions className="mt-4" withDivider onCancel={onClose} onConfirm={saveSetup} />
      </div>
    </>
  );
}
