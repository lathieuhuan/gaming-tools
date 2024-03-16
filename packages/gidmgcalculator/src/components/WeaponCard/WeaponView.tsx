import { useMemo } from "react";
import { Badge } from "rond";
import type { CalcWeapon, Level, UserWeapon } from "@Src/types";

import { LEVELS } from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { $AppData } from "@Src/services";
import { parseWeaponDescription, suffixOf, WeaponUtils } from "@Src/utils";

// Component
import { WikiImage } from "../WikiImage";

const groupStyles = "bg-dark-700 px-3";

export interface WeaponViewProps<T extends CalcWeapon | UserWeapon> {
  weapon?: T;
  mutable?: boolean;
  upgrade?: (newLevel: Level, weapon: T) => void;
  refine?: (newRefi: number, weapon: T) => void;
}
export function WeaponView<T extends CalcWeapon | UserWeapon>({
  weapon,
  mutable,
  upgrade,
  refine,
}: WeaponViewProps<T>) {
  const { t } = useTranslation();
  if (!weapon) return null;

  const appWeapon = $AppData.getWeapon(weapon.code)!;
  const { level, refi } = weapon;
  const { rarity, subStat } = appWeapon;
  const selectLevels = rarity < 3 ? LEVELS.slice(0, -4) : LEVELS;

  const passiveDescription = useMemo(() => {
    if (!appWeapon.descriptions) {
      return "";
    }
    return appWeapon.descriptions.map((content) => parseWeaponDescription(content, refi)).join(" ");
  }, [weapon.code, refi]);

  return (
    <div className="w-full" onDoubleClick={() => console.log(weapon)}>
      <p className={`text-1.5xl text-rarity-${rarity} font-semibold`}>{appWeapon.name}</p>

      <div className="mt-2 flex">
        {/* left */}
        <div className="flex flex-col grow justify-between space-y-1">
          <div className={"pt-1 grow flex items-center " + groupStyles}>
            <p className="mr-2 text-lg font-semibold">Level</p>
            {mutable ? (
              <select
                className={`text-lg text-rarity-${rarity} font-bold text-last-right`}
                value={level}
                onChange={(e) => upgrade && upgrade(e.target.value as Level, weapon)}
              >
                {selectLevels.map((_, index) => (
                  <option key={index}>{selectLevels[selectLevels.length - 1 - index]}</option>
                ))}
              </select>
            ) : (
              <p className={`text-lg text-rarity-${rarity} font-bold`}>{level}</p>
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
              <p className={`text-rarity-${rarity} text-2xl leading-7 font-bold`}>
                {WeaponUtils.getSubStatValue(level, subStat.scale)}
                {suffixOf(subStat.type)}
              </p>
            </div>
          ) : null}

          <div className={"grow pt-1 flex flex-col justify-center " + groupStyles}>
            <p className="font-semibold">Base ATK</p>
            <p className={`text-rarity-${rarity} text-2.5xl font-bold`}>
              {WeaponUtils.getMainStatValue(level, appWeapon.mainStatScale)}
            </p>
          </div>
        </div>

        {/* right */}
        <div className="ml-2">
          <div className={`rounded-lg bg-gradient-${rarity} relative`}>
            <WikiImage src={appWeapon.icon} imgType="weapon" style={{ width: 112, height: 112 }} />
            <Badge active={appWeapon.beta} className="absolute bottom-0 right-0">
              BETA
            </Badge>
          </div>

          {rarity >= 3 && (
            <div className={"mt-2 py-1 flex flex-col items-center " + groupStyles}>
              <p className="text-center font-semibold">Refinement</p>
              {mutable ? (
                <select
                  className={`text-lg text-rarity-${rarity} font-bold`}
                  value={refi}
                  onChange={(e) => refine && refine(+e.target.value, weapon)}
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              ) : (
                <p className={`text-lg text-rarity-${rarity} font-bold`}>{refi}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-orange-500">{appWeapon.passiveName}</p>
        <p className="indent-4 text-base" dangerouslySetInnerHTML={{ __html: passiveDescription }} />
      </div>
    </div>
  );
}
