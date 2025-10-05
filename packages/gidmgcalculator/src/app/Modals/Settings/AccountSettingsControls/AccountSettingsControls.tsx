import { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { clsx, CollapseSpace } from "rond";

import { $AppCharacter } from "@/services";
import { TravelerInfo, TravelerKey, PowerupKey } from "@/types";

import { CharacterPortrait } from "@/components";
import { SettingsGroupCard, SettingsGroupItem, SettingsGroupItems, SettingsGroupTitle } from "../SettingsGroup";

type AccountSettingsControlsProps = {
  className?: string;
  initialTraveler: TravelerInfo;
  onChangeSelection: (selection: TravelerKey) => void;
  onChangePowerups: (key: PowerupKey, value: boolean) => void;
};

export function AccountSettingsControls({
  className,
  initialTraveler,
  onChangeSelection,
  onChangePowerups,
}: AccountSettingsControlsProps) {
  const TRAVELERS: TravelerKey[] = ["AETHER", "LUMINE"];
  const POWERUPS: PowerupKey[] = ["cannedKnowledge", "skirksTraining"];

  const [selectedTraveler, setSelectedTraveler] = useState(initialTraveler.selection);
  const [selectedPowerups, setSelectedPowerups] = useState(() =>
    Object.entries(initialTraveler.powerups)
      .filter(([_, value]) => value)
      .map(([key]) => key)
  );
  const [powerupsExpanded, setPowerupsExpanded] = useState(false);

  const handleSelectTraveler = (traveler: TravelerKey) => {
    if (traveler !== selectedTraveler) {
      setSelectedTraveler(traveler);
      onChangeSelection(traveler);
    }
  };

  const handlePowerupToggle = (key: PowerupKey, activated: boolean) => {
    setSelectedPowerups((prev) => (activated ? [...prev, key] : prev.filter((k) => k !== key)));
    onChangePowerups(key, activated);
  };

  const handleAllPowerupsToggle = (activated: boolean) => {
    setSelectedPowerups(activated ? POWERUPS : []);
    POWERUPS.forEach((key) => onChangePowerups(key, activated));
  };

  const items: SettingsGroupItem[] = [
    {
      key: "all",
      type: "CHECK",
      label: "All",
      className: "w-fit",
      checked: selectedPowerups.length === POWERUPS.length,
      indeterminate: selectedPowerups.length > 0 && selectedPowerups.length < POWERUPS.length,
      onChange: (value: boolean) => handleAllPowerupsToggle(value),
    },
    {
      key: "cannedKnowledge",
      type: "CHECK",
      label: (
        <>
          Canned Knowledge
          <br />
          <span className="text-light-hint text-sm">(Archon Quest: Ever So Close)</span>
        </>
      ),
      className: "w-fit",
      checked: selectedPowerups.includes("cannedKnowledge"),
      onChange: (value: boolean) => handlePowerupToggle("cannedKnowledge", value),
    },
    {
      key: "skirksTraining",
      type: "CHECK",
      label: (
        <>
          Skirk's Training
          <br />
          <span className="text-light-hint text-sm">(Skirk's Story Quest)</span>
        </>
      ),
      className: "w-fit",
      checked: selectedPowerups.includes("skirksTraining"),
      onChange: (value: boolean) => handlePowerupToggle("skirksTraining", value),
    },
  ];

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
                className={selected ? "shadow-hightlight-2 shadow-active" : ""}
                size="small"
                zoomable={false}
                info={info}
                onClick={() => handleSelectTraveler(traveler)}
              />
            );
          })}
        </div>
      </div>

      <button
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
      </CollapseSpace>
    </SettingsGroupCard>
  );
}
