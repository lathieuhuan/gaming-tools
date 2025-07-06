import { useState } from "react";
import { Input, Modal } from "rond";

import type { Party } from "@Src/types";
import Setup_ from "@Src/utils/setup-utils";
import Array_ from "@Src/utils/array-utils";
import { useStoreSnapshot } from "@Src/features";
import { useCharacterData } from "../../hooks";

// Store
import { useDispatch } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";
import { selectUserSetups } from "@Store/userdb-slice";

function areDifferentParties(party1: Party, party2: Party) {
  const team1 = Array_.truthy(party1);
  const team2 = Array_.truthy(party2);
  return team1.length !== team2.length || team1.some((t1) => team2.every((t2) => t2.name !== t1.name));
}

interface SaveSetupProps {
  setupId: number;
  onClose: () => void;
}
export function SaveSetup({ setupId, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();

  const record = useCharacterData();
  const existedSetup = Array_.findById(useStoreSnapshot(selectUserSetups), setupId);

  const [input, setInput] = useState(existedSetup ? existedSetup.name : `${record.appCharacter.name} setup`);

  if (
    existedSetup &&
    Setup_.isUserSetup(existedSetup) &&
    existedSetup.type === "combined" &&
    areDifferentParties(existedSetup.party, record.party)
  ) {
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
          {existedSetup ? "Do you what to update this setup" : "Do you what to save this setup as"}
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
