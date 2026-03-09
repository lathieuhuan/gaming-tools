import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { GiAnvil } from "react-icons/gi";
import { ButtonGroup, clsx, HiddenSpace, PouchSvg } from "rond";

import type { Character } from "@/models";
import type { ArtifactType } from "@/types";

import { useTranslation } from "@/hooks";
import { updateMember } from "./actions";

import {
  ArtifactView,
  CharacterIntro,
  EquipmentDisplay,
  EquipmentType,
  WeaponView,
} from "@/components";
import { MemberConfigTalents } from "./MemberConfigTalents";

export type GearSwitchSource = "INVENTORY" | "FORGE";

export type MemberConfigProps = {
  className?: string;
  character: Character;
  onSwitchMember?: () => void;
  onRemoveMember?: () => void;
  onSwitchWeapon?: (source: GearSwitchSource) => void;
  onSwitchArtifact?: (source: GearSwitchSource, type: ArtifactType) => void;
};

export function MemberConfig(props: MemberConfigProps) {
  const { t } = useTranslation();

  const [selectedGear, setSelectedGear] = useState<EquipmentType>();

  const { character } = props;
  const { data } = character;
  const elmtText = `text-${data.vision}`;
  const selectedAtfPiece =
    selectedGear && selectedGear !== "weapon"
      ? character.atfGear.pieces.get(selectedGear)
      : undefined;

  const toggleSelectedGear = (type: EquipmentType) => {
    setSelectedGear((prev) => (prev === type ? undefined : type));
  };

  return (
    <div className="flex">
      <div className={props.className}>
        <div className="h-full flex flex-col">
          <CharacterIntro
            character={character}
            switchable
            removable
            mutable
            onSwitch={props.onSwitchMember}
            onRemove={props.onRemoveMember}
            onChangeLevel={(level) => updateMember(data.code, "level", level)}
            onChangeCons={(cons) => updateMember(data.code, "cons", cons)}
            onEnhanceToggle={(enhanced) => updateMember(data.code, "enhanced", enhanced)}
          />

          <div className="mt-3 grow hide-scrollbar">
            <MemberConfigTalents character={character} />

            <EquipmentDisplay
              className="mt-3"
              fillable
              selectedType={selectedGear}
              weapon={character.weapon}
              atfGear={character.atfGear}
              onClickItem={toggleSelectedGear}
              onClickEmptyAtfSlot={toggleSelectedGear}
            />
          </div>
        </div>
      </div>

      <HiddenSpace
        active={selectedGear !== undefined}
        className="py-2 flex"
        afterClose={() => setSelectedGear(undefined)}
      >
        <div className={clsx(`h-full ml-px rounded-l-none bg-surface-1`, props.className)}>
          {selectedGear === "weapon" && (
            <div className="h-full flex flex-col items-end">
              <WeaponView
                className="mt-2 grow hide-scrollbar"
                mutable
                weapon={character.weapon}
                // upgrade={(level) => props.onChangeWeapon({ level })}
                // refine={(refi) => props.onChangeWeapon({ refi })}
              />

              <ButtonGroup
                className="mx-auto"
                buttons={[
                  {
                    icon: <PouchSvg className="text-xl" />,
                    title: "Inventory",
                    onClick: () => props.onSwitchWeapon?.("INVENTORY"),
                  },
                  {
                    icon: <GiAnvil className="text-xl" />,
                    title: "Forge",
                    onClick: () => props.onSwitchWeapon?.("FORGE"),
                  },
                ]}
              />
            </div>
          )}

          {selectedGear && selectedGear !== "weapon" && (
            <div className="h-full flex flex-col items-end">
              <div className="w-full mt-3 grow hide-scrollbar">
                {selectedAtfPiece ? (
                  <ArtifactView
                    mutable
                    artifact={selectedAtfPiece}
                    // onEnhance={(level) => {
                    //   props.onChangeArtifact(chosenGearIndex, {
                    //     level,
                    //   });
                    // }}
                    // onChangeMainStatType={(mainStatType) => {
                    //   props.onChangeArtifact(chosenGearIndex, {
                    //     mainStatType,
                    //   });
                    // }}
                    // onChangeSubStat={(subStatIndex, change, artifact) => {
                    //   const newSubStats = [...artifact.subStats];

                    //   newSubStats[subStatIndex] = {
                    //     ...newSubStats[subStatIndex],
                    //     ...change,
                    //   };

                    //   props.onChangeArtifact(chosenGearIndex, {
                    //     subStats: newSubStats,
                    //   });
                    // }}
                  />
                ) : (
                  <p className="py-2 text-center text-lg text-hint-color">No {t(selectedGear)}</p>
                )}
              </div>

              <ButtonGroup
                className="mx-auto"
                buttons={[
                  {
                    icon: <FaTrashAlt />,
                    className: !selectedAtfPiece && "hidden",
                    // onClick: () => props.onChangeArtifact(chosenGearIndex, null),
                  },
                  {
                    icon: <PouchSvg className="text-xl" />,
                    title: "Inventory",
                    onClick: () => props.onSwitchArtifact?.("INVENTORY", selectedGear),
                  },
                  {
                    icon: <GiAnvil className="text-xl" />,
                    title: "Forge",
                    onClick: () => props.onSwitchArtifact?.("FORGE", selectedGear),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </HiddenSpace>
    </div>
  );
}
