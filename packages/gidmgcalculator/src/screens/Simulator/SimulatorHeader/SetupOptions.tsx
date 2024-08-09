import { useState } from "react";
import { Button, AdvancedPick, PartiallyRequiredOnly } from "rond";

import type { Character } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { CharacterPortrait, EquipmentDisplay, EquipmentDisplayProps } from "@Src/components";

type SetupOptionMember = PartiallyRequiredOnly<Character, "name"> &
  AdvancedPick<EquipmentDisplayProps, "weapon" | "artifacts", "appWeapon"> & {
    //
  };

export type SetupOption = {
  id: number;
  name: string;
  members: SetupOptionMember[];
};

interface SetupOptionsProps {
  setups: SetupOption[];
  onSelect: (setupOption: SetupOption) => void;
}
export function SetupOptions({ setups, onSelect }: SetupOptionsProps) {
  const [selected, setSelected] = useState({
    setupId: 0,
    member: "",
  });

  const renderSelectedEquipment = (member?: SetupOptionMember) => {
    if (member) {
      return (
        <div>
          <EquipmentDisplay {...member} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      {setups.map((setup) => {
        return (
          <div key={setup.id} className="px-2 py-1 rounded w-fit bg-surface-3" onClick={() => onSelect(setup)}>
            <div>{setup.name}</div>
            <div className="flex gap-3">
              {setup.members.map((member, i) => {
                const appMember = $AppCharacter.get(member.name);

                return (
                  <CharacterPortrait
                    size="small"
                    key={i}
                    info={{
                      name: member.name,
                      code: appMember.code,
                      icon: appMember.icon,
                      vision: appMember.vision,
                    }}
                    onClick={() => setSelected({ setupId: setup.id, member: member.name })}
                  />
                );
              })}
            </div>

            {setup.id === selected.setupId
              ? renderSelectedEquipment(setup.members.find((member) => member.name === selected.member))
              : null}

            <div className="flex justify-end">
              <Button onClick={() => onSelect(setup)}>Select</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
