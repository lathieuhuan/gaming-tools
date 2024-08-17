import { useState } from "react";
import { FaLink } from "react-icons/fa";
import { Button, AdvancedPick, PartiallyRequiredOnly } from "rond";

import type { Character } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { CharacterPortrait, EquipmentDisplay, EquipmentDisplayProps } from "@Src/components";

export type SetupOptionMember = PartiallyRequiredOnly<Character, "name"> &
  AdvancedPick<EquipmentDisplayProps, "weapon" | "artifacts", "appWeapon"> & {
    //
  };

export type SetupOption = {
  id: number;
  name: string;
  /** Whether this option is made from a UserComplexSetup */
  isComplex?: boolean;
  members: SetupOptionMember[];
};

interface SetupOptionsProps<TOption extends SetupOption> {
  setups: TOption[];
  onSelect: (setupOption: TOption) => void;
}
export function SetupOptions<TOption extends SetupOption = SetupOption>({
  setups,
  onSelect,
}: SetupOptionsProps<TOption>) {
  const [selected, setSelected] = useState({
    setupId: 0,
    member: "",
  });

  const onClickSetupMember = (setupId: number, member: string, selected: boolean) => {
    setSelected(selected ? { setupId: 0, member: "" } : { setupId, member });
  };

  if (!setups.length) {
    return <div className="py-4 text-xl text-center text-hint-color font-semibold">No setups found</div>;
  }

  return (
    <div className="grid grid-cols-1 xm:grid-cols-2 gap-4">
      {setups.map((setup) => {
        const selectedMember =
          setup.id === selected.setupId ? setup.members.find((member) => member.name === selected.member) : undefined;

        return (
          <div key={setup.id}>
            <div className="p-3 rounded-lg bg-surface-1">
              <div className="flex justify-between gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  {setup.isComplex && (
                    <span>
                      <FaLink className="text-hint-color text-sm" />
                    </span>
                  )}{" "}
                  <span className="text-lg font-semibold truncate">{setup.name}</span>
                </div>
                <Button size="small" variant={selectedMember ? "primary" : "default"} onClick={() => onSelect(setup)}>
                  Select
                </Button>
              </div>

              <div className="mt-4 mx-auto" style={{ maxWidth: "18.25rem" }}>
                <div className="flex gap-3">
                  {setup.members.map((member, i) => {
                    const appMember = $AppCharacter.get(member.name);
                    const selected = member.name === selectedMember?.name;

                    return (
                      <CharacterPortrait
                        key={i}
                        className={selected ? "shadow-5px-1px shadow-active-color" : ""}
                        size="small"
                        info={{
                          name: member.name,
                          code: appMember.code,
                          icon: appMember.icon,
                          vision: appMember.vision,
                        }}
                        onClick={() => onClickSetupMember(setup.id, member.name, member.name === selectedMember?.name)}
                      />
                    );
                  })}
                </div>

                {selectedMember ? <EquipmentDisplay className="mt-3" compact muted {...selectedMember} /> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
