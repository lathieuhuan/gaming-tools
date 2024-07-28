import { FaSyncAlt } from "react-icons/fa";
import { Badge, Button, VersatileSelect } from "rond";

import { GenshinImage } from "@Src/components";
import { $AppCharacter } from "@Src/services";
import { SimulationMember } from "@Src/types";
import { LEVELS, Level } from "@Backend";
import { useState } from "react";

export function SimulationStarter() {
  const [members, setMembers] = useState<SimulationMember[]>([]);

  const onSwitch = () => {
    //
  };

  return (
    <div className="flex gap-3">
      {Array.from({ length: 4 }, (_, i) => {
        return (
          <div key={i} className="p-4 rounded bg-surface-1">
            <MemberConfig
              character={members[i]}
              onSwitch={onSwitch}
              onChangeLevel={(level) => {
                setMembers(
                  members.map((member, index) => {
                    return index === i
                      ? {
                          ...member,
                          level,
                        }
                      : member;
                  })
                );
              }}
              onChangeConstellation={(constellation) => {
                setMembers(
                  members.map((member, index) => {
                    return index === i
                      ? {
                          ...member,
                          cons: constellation,
                        }
                      : member;
                  })
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

interface MemberConfigProps {
  character?: SimulationMember;
  onSwitch: () => void;
  onChangeLevel: (newLevel: Level) => void;
  onChangeConstellation: (newConstellation: number) => void;
}
function MemberConfig({ character, onSwitch, onChangeLevel, onChangeConstellation }: MemberConfigProps) {
  const appChar = character ? $AppCharacter.get(character.name) : null;
  const elmtText = appChar ? `text-${appChar.vision}` : "";

  return (
    <div>
      <div className="flex relative ">
        <div className="mr-3 relative shrink-0" onClick={onSwitch} style={{ width: "5.25rem", height: "5.25rem" }}>
          {appChar ? (
            <>
              <GenshinImage className="cursor-pointer" src={appChar.icon} imgType="character" fallbackCls="p-2" />
              <Button className="absolute -top-1 -left-1 z-10" icon={<FaSyncAlt />} />
              <Badge active={appChar.beta} className="absolute -top-1 -right-1 z-10">
                BETA
              </Badge>
            </>
          ) : (
            <GenshinImage className="cursor-pointer" imgType="character" fallbackCls="p-2" />
          )}
        </div>

        <div className="min-w-0 grow">
          <div className="overflow-hidden">
            {character ? <h2 className={`text-2xl truncate ${elmtText} font-black`}>{character.name}</h2> : null}
          </div>

          {character ? (
            <div className="mt-1 pl-1 flex justify-between items-center">
              <div className="flex items-center text-lg" aria-label="calculator_character-level">
                <label className="mr-1">Level</label>
                <VersatileSelect
                  title="Select Level"
                  align="right"
                  transparent
                  showAllOptions
                  className={`shrink-0 ${elmtText} text-lg font-bold`}
                  style={{ width: "4.75rem" }}
                  dropdownCls="z-20"
                  options={LEVELS.map((_, i) => {
                    const item = LEVELS[LEVELS.length - 1 - i];
                    return { label: item, value: item };
                  })}
                  value={character.level}
                  onChange={(value) => onChangeLevel(value as Level)}
                />
              </div>

              <VersatileSelect
                title="Select Constellation Level"
                className={`ml-auto w-14 text-lg ${elmtText} font-bold bg-surface-2`}
                align="right"
                options={Array.from({ length: 7 }, (_, i) => ({
                  label: `C${i}`,
                  value: i,
                }))}
                value={character.cons}
                onChange={(newCons) => onChangeConstellation(newCons as number)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
