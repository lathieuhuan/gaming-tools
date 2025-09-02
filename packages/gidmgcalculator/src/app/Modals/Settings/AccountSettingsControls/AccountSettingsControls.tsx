import { useState } from "react";

import { Traveler } from "@/types";
import { $AppCharacter } from "@/services";

import { CharacterPortrait } from "@/components";
import { SettingsGroupCard, SettingsGroupTitle } from "../SettingsGroup";
import { AccountIngame } from "@Store/account-slice/types";

type AccountSettingsControlsProps = {
  className?: string;
  initialValues: AccountIngame;
  onChange: (values: AccountIngame) => void;
};

export function AccountSettingsControls({ className, initialValues, onChange }: AccountSettingsControlsProps) {
  const [selectedOne, setSelectedOne] = useState(initialValues.traveler);
  const TRAVELERS: Traveler[] = ["AETHER", "LUMINE"];

  const handleSelectTraveler = (traveler: Traveler) => {
    if (traveler !== selectedOne) {
      setSelectedOne(traveler);
      onChange({ ...initialValues, traveler });
    }
  };

  return (
    <SettingsGroupCard className={className}>
      <div className="flex justify-between">
        <SettingsGroupTitle>Traveler</SettingsGroupTitle>

        <div className="py-2 flex gap-3">
          {TRAVELERS.map((traveler) => {
            const info = $AppCharacter.getTravelerProps(traveler);
            const selected = traveler === selectedOne;

            return (
              <CharacterPortrait
                key={traveler}
                className={selected ? "shadow-3px-3px shadow-active-color" : ""}
                size="small"
                zoomable={false}
                info={{
                  ...info,
                  name: traveler === "LUMINE" ? "Lumine" : "Aether",
                }}
                onClick={() => handleSelectTraveler(traveler)}
              />
            );
          })}
        </div>
      </div>
    </SettingsGroupCard>
  );
}
