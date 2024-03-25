import { useState } from "react";
import { Input, Modal } from "rond";

import type { CalcSetupManageInfo, Party } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { Setup_, findById } from "@Src/utils";
import { useStoreSnapshot } from "@Src/features";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";
import { selectCharacter, selectParty } from "@Store/calculator-slice";
import { selectUserSetups } from "@Store/userdb-slice";

function areDifferentParties(party1: Party, party2: Party) {
  const team1 = Setup_.teammatesOf(party1);
  const team2 = Setup_.teammatesOf(party2);
  return team1.length !== team2.length || team1.some((t1) => team2.every((t2) => t2.name !== t1.name));
}

interface SaveSetupProps {
  manageInfo: CalcSetupManageInfo;
  onClose: () => void;
}
export function SaveSetup({ manageInfo, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const party = useSelector(selectParty);

  const appChar = $AppCharacter.get(char.name);
  const existedSetup = findById(useStoreSnapshot(selectUserSetups), manageInfo.ID);

  const [input, setInput] = useState(existedSetup ? existedSetup.name : `${appChar.name} setup`);

  if (
    existedSetup &&
    Setup_.isUserSetup(existedSetup) &&
    existedSetup.type === "combined" &&
    areDifferentParties(existedSetup.party, party)
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
    dispatch(saveSetupThunk(manageInfo.ID, input));
    onClose();
  };

  return (
    <>
      <div className="flex flex-col">
        <p className="mb-2 text-hint-color">
          {existedSetup ? "Do you what to update this setup" : "Do you what to save this setup as"}
        </p>
        <Input
          className="px-4 py-2 text-1.5xl text-center font-semibold"
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
