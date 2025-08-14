import { useMemo } from "react";
import { Badge, VersatileSelect, clsx, type ClassValue } from "rond";
import { LEVELS, Level, WeaponCalc } from "@Calculation";

import type { CalcWeapon, UserWeapon } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppWeapon } from "@Src/services";
import { genSequentialOptions } from "@Src/utils";
import { parseWeaponDesc } from "@Src/utils/description-parsers";
import Entity_ from "@Src/utils/entity-utils";

// Component
import { GenshinImage } from "../GenshinImage";

const groupStyles = "bg-surface-2 px-3";

export interface WeaponViewProps<T extends CalcWeapon | UserWeapon> {
  className?: ClassValue;
  weapon?: T;
  mutable?: boolean;
  upgrade?: (newLevel: Level, weapon: T) => void;
  refine?: (newRefi: number, weapon: T) => void;
}
export function WeaponView<T extends CalcWeapon | UserWeapon>({
  className,
  weapon,
  mutable,
  upgrade,
  refine,
}: WeaponViewProps<T>) {
  const { t } = useTranslation();
  const appWeapon = weapon ? $AppWeapon.get(weapon.code) : undefined;

  const passiveDescription = useMemo(() => {
    if (!appWeapon?.descriptions || !weapon?.refi) {
      return "";
    }
    return appWeapon.descriptions.map((content) => parseWeaponDesc(content, weapon.refi)).join(" ");
  }, [appWeapon?.code, weapon?.refi]);

  if (!weapon || !appWeapon) return null;

  const { rarity, subStat } = appWeapon;
  const selectLevels = rarity < 3 ? LEVELS.slice(0, -4) : LEVELS;

  return (
    <div className={clsx("w-full", className)} onDoubleClick={() => console.log(weapon)}>
      <p className={`text-1.5xl text-rarity-${rarity} font-semibold`}>{appWeapon.name}</p>

      <div className="mt-2 flex">
        {/* left */}
        <div className="flex flex-col grow justify-between space-y-1">
          <div className={"pt-1 grow flex items-center " + groupStyles}>
            <p className="mr-1 text-lg font-semibold">Level</p>
            {mutable ? (
              <VersatileSelect
                title="Select Level"
                className={`text-rarity-${rarity} font-bold`}
                style={{ width: "4.75rem " }}
                size="medium"
                align="right"
                transparent
                options={selectLevels.map((_, i) => {
                  const item = selectLevels[selectLevels.length - 1 - i];
                  return { label: item, value: item };
                })}
                value={weapon.level}
                onChange={(value) => upgrade && upgrade(value as Level, weapon)}
              />
            ) : (
              <p className={`text-lg text-rarity-${rarity} font-bold`}>{weapon.level}</p>
            )}
          </div>

          {subStat ? (
            <div className={"grow pt-1 flex flex-col justify-center " + groupStyles}>
              <p
                className={
                  "font-semibold leading-6 " + (["er_", "em"].includes(subStat.type) ? "text-sm" : "text-base")
                }
              >
                {t(subStat.type)}
              </p>
              <p className={`text-rarity-${rarity} text-1.5xl leading-7 font-bold`}>
                {WeaponCalc.getSubStatValue(weapon.level, subStat.scale)}
                {Entity_.suffixOf(subStat.type)}
              </p>
            </div>
          ) : null}

          <div className={"grow pt-1 flex flex-col justify-center " + groupStyles}>
            <p className="font-semibold">Base ATK</p>
            <p className={`text-rarity-${rarity} text-2.5xl font-bold`}>
              {WeaponCalc.getMainStatValue(weapon.level, appWeapon.mainStatScale)}
            </p>
          </div>
        </div>

        {/* right */}
        <div className="ml-2">
          <div className={`rounded-lg bg-gradient-${rarity} relative`}>
            <GenshinImage src={appWeapon.icon} imgType="weapon" width={112} height={112} />
            <Badge active={appWeapon.beta} className="absolute bottom-0 right-0">
              BETA
            </Badge>
          </div>

          {rarity >= 3 && (
            <div className={"mt-2 py-1 flex flex-col items-center " + groupStyles}>
              <p className="text-center font-semibold">Refinement</p>
              {mutable ? (
                <VersatileSelect
                  title="Select Refinement"
                  className={`w-10 text-lg text-rarity-${rarity} font-bold`}
                  transparent
                  align="right"
                  options={genSequentialOptions(5)}
                  value={weapon.refi}
                  onChange={(value) => refine && refine(+value, weapon)}
                />
              ) : (
                <p className={`text-lg text-rarity-${rarity} font-bold`}>{weapon.refi}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-heading-color">{appWeapon.passiveName}</p>
        <p className="indent-4 text-base" dangerouslySetInnerHTML={{ __html: passiveDescription }} />
      </div>
    </div>
  );
}
