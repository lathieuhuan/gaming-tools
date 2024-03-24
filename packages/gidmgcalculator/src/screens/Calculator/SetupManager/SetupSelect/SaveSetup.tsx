import { FormEvent, useState } from "react";
import { Input } from "rond";

import type { CalcSetupManageInfo } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { findById } from "@Src/utils";
import { useStoreSnapshot } from "@Src/features";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";
import { selectCharacter } from "@Store/calculator-slice";
import { selectUserSetups } from "@Store/userdb-slice";

interface SaveSetupProps {
  manageInfo: CalcSetupManageInfo;
  onClose: () => void;
}
export function SaveSetup({ manageInfo, onClose }: SaveSetupProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);

  const appChar = $AppCharacter.get(char.name);
  const existedSetup = findById(useStoreSnapshot(selectUserSetups), manageInfo.ID);

  const [input, setInput] = useState(existedSetup ? existedSetup.name : `${appChar.name} setup`);

  const saveSetup = () => {
    dispatch(saveSetupThunk(manageInfo.ID, input));
    onClose();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveSetup();
  };

  return (
    <form id="save-calc-setup" className="flex flex-col" onSubmit={onSubmit}>
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
    </form>
  );
}
