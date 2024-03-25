import { memo, useState } from "react";
import { FaUserSlash } from "react-icons/fa";
import { createSelector } from "@reduxjs/toolkit";
import { useScreenWatcher, Button, ConfirmModal, LoadingSpin, Rarity } from "rond";

import type { Level } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { useAppCharacter } from "@Src/hooks";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectChosenCharacter,
  selectUserArtifacts,
  selectUserCharacters,
  selectUserWeapons,
  removeUserCharacter,
  updateUserCharacter,
} from "@Store/userdb-slice";

// Util
import { getCalculationStats } from "@Src/calculation";
import { findById, findByName } from "@Src/utils";

// Component
import { AttributeTable, TalentList, ConstellationList, GenshinImage } from "@Src/components";
import Gears from "./Gears";

const selectChosenInfo = createSelector(
  selectUserCharacters,
  selectUserWeapons,
  selectUserArtifacts,
  selectChosenCharacter,
  (userChars, userWps, userArts, chosen) => {
    const { weaponID, artifactIDs, ...char } = findByName(userChars, chosen)!;

    return {
      char,
      weapon: findById(userWps, weaponID),
      artifacts: artifactIDs.map((ID) => (ID ? findById(userArts, ID)! : null)),
    };
  }
);

const CharacterInfo = () => {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const { char, weapon, artifacts } = useSelector(selectChosenInfo);
  const { isLoading, error, appChar } = useAppCharacter(char.name);

  const [removing, setRemoving] = useState(false);

  const wrapperProps = {
    className: "py-4 flex h-98/100 space-x-2 custom-scrollbar",
    style: {
      width: screenWatcher.isFromSize("sm") ? "88%" : "calc(100% - 2rem)",
    },
  };

  if (isLoading || error) {
    return (
      <div {...wrapperProps}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-surface-1 shrink-0" style={{ width: 332 }}>
            {error ? (
              <p className="text-center text-danger-3">{error}</p>
            ) : (
              <div className="w-full h-full flex-center">
                <LoadingSpin />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!appChar || !weapon) return null;
  const { name, icon, rarity, vision: elementType } = appChar;

  const { totalAttr, artAttr } = getCalculationStats({
    char,
    appChar,
    weapon,
    artifacts,
  });
  const isFromXmSize = screenWatcher.isFromSize("md");

  return (
    <div {...wrapperProps}>
      <div className="p-4 rounded-lg bg-surface-1 flex flex-col relative">
        <Button className="absolute top-4 right-4" boneOnly icon={<FaUserSlash />} onClick={() => setRemoving(true)} />

        <div className="flex" onDoubleClick={() => console.log(char, weapon, artifacts)}>
          {!isFromXmSize && <GenshinImage className="mr-4 mb-4 w-20" src={icon} alt={name} imgType="character" />}

          <div>
            {isFromXmSize && <p className={`text-2.5xl text-${elementType} font-black`}>{name}</p>}
            <Rarity className="mt-1" value={rarity} />

            <div className="mt-1 flex text-lg">
              <p className="mr-1">Level</p>
              <select
                className={`text-right text-last-right text-${elementType} font-semibold`}
                value={char.level}
                onChange={(e) => dispatch(updateUserCharacter({ name, level: e.target.value as Level }))}
              >
                {LEVELS.map((lv, i) => (
                  <option key={i}>{LEVELS[LEVELS.length - 1 - i]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-1 grow w-76 h-0 custom-scrollbar">
          <AttributeTable attributes={totalAttr} />
        </div>
      </div>

      <Gears weapon={weapon} artifacts={artifacts} artAttr={artAttr} />

      <div className="p-4 rounded-lg bg-surface-1">
        <div className="h-full w-76">
          <ConstellationList
            char={char}
            onClickIcon={(i) => {
              dispatch(
                updateUserCharacter({
                  name: char.name,
                  cons: char.cons === i + 1 ? i : i + 1,
                })
              );
            }}
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-surface-1">
        <div className="h-full w-76">
          <TalentList
            key={char.name}
            char={char}
            onChangeTalentLevel={(type, level) => {
              dispatch(updateUserCharacter({ name: char.name, [type]: level }));
            }}
          />
        </div>
      </div>

      <ConfirmModal
        active={removing}
        danger
        message={
          <>
            Remove <b>{name}</b>?
          </>
        }
        focusConfirm
        onConfirm={() => dispatch(removeUserCharacter(name))}
        onClose={() => setRemoving(false)}
      />
    </div>
  );
};

export default memo(CharacterInfo);
