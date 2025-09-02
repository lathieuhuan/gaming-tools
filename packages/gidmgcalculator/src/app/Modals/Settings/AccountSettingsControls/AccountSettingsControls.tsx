import { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { clsx, CollapseSpace } from "rond";

import { $AppCharacter } from "@/services";
import { TravelerInfo, TravelerKey } from "@/types";

import { CharacterPortrait } from "@/components";
import { SettingsGroupCard, SettingsGroupItem, SettingsGroupItems, SettingsGroupTitle } from "../SettingsGroup";

type AccountSettingsControlsProps = {
  className?: string;
  initialTraveler: TravelerInfo;
  onChangeSelection: (selection: TravelerKey) => void;
  onChangePowerups: (key: keyof TravelerInfo["powerups"], value: boolean) => void;
};

export function AccountSettingsControls({
  className,
  initialTraveler,
  onChangeSelection,
  onChangePowerups,
}: AccountSettingsControlsProps) {
  // const { powerups } = initialTraveler;
  const TRAVELERS: TravelerKey[] = ["AETHER", "LUMINE"];

  const [selectedTraveler, setSelectedTraveler] = useState(initialTraveler.selection);
  // const [powerupsExpanded, setPowerupsExpanded] = useState(false);

  const handleSelectTraveler = (traveler: TravelerKey) => {
    if (traveler !== selectedTraveler) {
      setSelectedTraveler(traveler);
      onChangeSelection(traveler);
    }
  };

  // const handlePowerupChange = (powerup: keyof TravelerInfo["powerups"], value: boolean) => {
  //   onChangePowerups(powerup, value);
  // };

  // const items: SettingsGroupItem[] = [
  //   {
  //     key: "cannedKnowledge",
  //     label: "Canned Knowledge",
  //     defaultValue: powerups.cannedKnowledge,
  //     type: "CHECK",
  //     onChange: (value) => handlePowerupChange("cannedKnowledge", value),
  //   },
  //   {
  //     key: "skirksTraining",
  //     label: "Skirk's Training",
  //     defaultValue: powerups.skirksTraining,
  //     type: "CHECK",
  //     onChange: (value) => handlePowerupChange("skirksTraining", value),
  //   },
  // ];

  return (
    <SettingsGroupCard className={className}>
      <div className="flex justify-between">
        <SettingsGroupTitle>Traveler</SettingsGroupTitle>

        <div className="py-2 flex gap-3">
          {TRAVELERS.map((traveler) => {
            const info = $AppCharacter.getTravelerProps({ selection: traveler });
            const selected = traveler === selectedTraveler;

            return (
              <CharacterPortrait
                key={traveler}
                className={selected ? "shadow-3px-3px shadow-active-color" : ""}
                size="small"
                zoomable={false}
                info={info}
                onClick={() => handleSelectTraveler(traveler)}
              />
            );
          })}
        </div>
      </div>

      {/* <button
        type="button"
        className="text-sm font-semibold flex items-center gap-1"
        onClick={() => setPowerupsExpanded(!powerupsExpanded)}
      >
        <FaCaretRight className={clsx("duration-200 ease-linear", powerupsExpanded && "rotate-90")} />
        <span>
          <span className={clsx(powerupsExpanded && "underline underline-offset-4")}>POWER-UPs</span> (spoilers)
        </span>
      </button>
      <CollapseSpace active={powerupsExpanded}>
        <SettingsGroupItems className="pt-4" items={items} />
      </CollapseSpace> */}
    </SettingsGroupCard>
  );
}
