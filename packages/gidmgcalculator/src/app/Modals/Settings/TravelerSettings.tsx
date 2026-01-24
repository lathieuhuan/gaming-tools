import { produce } from "immer";
import { useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { Checkbox, clsx, CollapseSpace } from "rond";

import { ELEMENT_TYPES } from "@/constants";
import { $AppCharacter } from "@/services";
import { ElementType, PowerupKey, TravelerConfig, TravelerKey } from "@/types";
import Object_ from "@/utils/Object";

import { CharacterPortrait } from "@/components";
import {
  SettingsGroupCard,
  SettingsGroupItem,
  SettingsGroupItems,
  SettingsGroupTitle,
} from "./SettingsGroup";

const extractSelectedPowerups = (powerups: TravelerConfig["powerups"]) => {
  return Object_.entries(powerups).reduce<Set<PowerupKey>>((acc, [key, value]) => {
    return value ? acc.add(key) : acc;
  }, new Set());
};

type TravelerSettingsProps = {
  className?: string;
  initialConfig: TravelerConfig;
  onChangeSelection?: (selection: TravelerKey) => void;
  onChangePowerups?: (key: PowerupKey, value: boolean) => void;
  onChangeResonatedElmts?: (elmts: ElementType[]) => void;
};

export function TravelerSettings({
  className,
  initialConfig,
  onChangeSelection,
  onChangePowerups,
  onChangeResonatedElmts,
}: TravelerSettingsProps) {
  const TRAVELERS: TravelerKey[] = ["AETHER", "LUMINE"];
  const POWERUPS: PowerupKey[] = ["cannedKnowledge", "skirksTraining"];

  const [selectedTraveler, setSelectedTraveler] = useState(initialConfig.selection);
  const [selectedPowerups, setSelectedPowerups] = useState(() =>
    extractSelectedPowerups(initialConfig.powerups)
  );
  const [resonatedElmts, setResonatedElmts] = useState(() => new Set(initialConfig.resonatedElmts));

  const [powerupsExpanded, setPowerupsExpanded] = useState(false);

  const handleSelectTraveler = (traveler: TravelerKey) => {
    if (traveler !== selectedTraveler) {
      setSelectedTraveler(traveler);
      onChangeSelection?.(traveler);
    }
  };

  const handleAllPowerupsToggle = (activated: boolean) => {
    setSelectedPowerups(activated ? new Set(POWERUPS) : new Set());
    setResonatedElmts(activated ? new Set(ELEMENT_TYPES) : new Set());

    POWERUPS.forEach((key) => onChangePowerups?.(key, activated));
    onChangeResonatedElmts?.(activated ? Array.from(ELEMENT_TYPES) : []);
  };

  const handlePowerupToggle = (key: PowerupKey, activated: boolean) => {
    setSelectedPowerups(
      produce((powerups) => {
        activated ? powerups.add(key) : powerups.delete(key);
      })
    );

    onChangePowerups?.(key, activated);
  };

  const handleResonatedElmtToggle = (elmt: ElementType, activated: boolean) => {
    const newResonatedElmts = produce(resonatedElmts, (elmts) => {
      activated ? elmts.add(elmt) : elmts.delete(elmt);
    });

    setResonatedElmts(newResonatedElmts);
    onChangeResonatedElmts?.(Array.from(newResonatedElmts));
  };

  const isAllPowerupsSelected =
    selectedPowerups.size === POWERUPS.length && resonatedElmts.size === ELEMENT_TYPES.length;
  const isSomePowerupsSelected =
    !isAllPowerupsSelected && (selectedPowerups.size > 0 || resonatedElmts.size > 0);

  const items: SettingsGroupItem[] = [
    {
      key: "all",
      type: "CHECK",
      label: "All",
      controlProps: {
        className: "w-fit",
        checked: isAllPowerupsSelected,
        indeterminate: isSomePowerupsSelected,
        onChange: (value: boolean) => handleAllPowerupsToggle(value),
      },
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
      controlProps: {
        className: "w-fit",
        checked: selectedPowerups.has("cannedKnowledge"),
        onChange: (value: boolean) => handlePowerupToggle("cannedKnowledge", value),
      },
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
      controlProps: {
        className: "w-fit",
        checked: selectedPowerups.has("skirksTraining"),
        onChange: (value: boolean) => handlePowerupToggle("skirksTraining", value),
      },
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
        className="text-sm font-semibold flex items-center gap-1 glow-on-hover"
        onClick={() => setPowerupsExpanded(!powerupsExpanded)}
      >
        <FaCaretRight
          className={clsx("duration-200 ease-linear", powerupsExpanded && "rotate-90")}
        />
        <span>
          <span className={clsx(powerupsExpanded && "underline underline-offset-4")}>
            POWER-UPs
          </span>{" "}
          (spoilers)
        </span>
      </button>
      <CollapseSpace active={powerupsExpanded}>
        <SettingsGroupItems className="pt-4" items={items} />

        <div className="mt-3">
          <p>
            Resonated Elements{" "}
            <span className="text-light-hint text-sm">(Archon Quest: True Moon)</span>
          </p>
          <div className="mt-2 grid grid-cols-4 gap-3">
            {ELEMENT_TYPES.map((elmt) => (
              <Checkbox
                key={elmt}
                checked={resonatedElmts.has(elmt)}
                onChange={(value: boolean) => handleResonatedElmtToggle(elmt, value)}
              >
                <span className="text-sm capitalize">{elmt}</span>
              </Checkbox>
            ))}
          </div>
        </div>
      </CollapseSpace>
    </SettingsGroupCard>
  );
}
