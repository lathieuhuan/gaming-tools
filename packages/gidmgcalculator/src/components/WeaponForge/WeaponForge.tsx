import { useMemo, useRef, useState } from "react";
import { FancyBackSvg, Modal } from "rond";

import type { AppWeapon, WeaponType } from "@/types";

import { Weapon } from "@/models/base";
import { $AppWeapon } from "@/services";
import { createWeapon } from "@/utils/Entity";

// Component
import {
  AppEntityOptionModel,
  AppEntitySelect,
  AppEntitySelectProps,
} from "@/components/AppEntitySelect";
import { WeaponCard } from "@/components/WeaponCard";
import { WeaponFilter, WeaponFilterState } from "./WeaponFilter";

type WeaponOption = AppEntityOptionModel & {
  type: WeaponType;
  rarity: number;
  data: AppWeapon;
};

const weaponToOption = (weapon: AppWeapon): WeaponOption => {
  return {
    code: weapon.code,
    name: weapon.name,
    beta: weapon.beta,
    icon: weapon.icon,
    rarity: weapon.rarity,
    type: weapon.type,
    data: weapon,
  };
};

export type WeaponForgeProps = Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> & {
  forcedType?: WeaponType;
  onForgeWeapon: (weapon: Weapon) => void;
  onClose: () => void;
};

function WeaponSmith({ forcedType, onForgeWeapon, onClose, ...templateProps }: WeaponForgeProps) {
  const filterRef = useRef<WeaponFilterState>(
    forcedType
      ? {
          types: [forcedType],
          rarities: [],
        }
      : {
          types: ["bow"],
          rarities: [4, 5],
        }
  );

  const weaponOptions = useMemo(() => {
    const weapons = $AppWeapon.getAll();

    if (forcedType) {
      return weapons.reduce<WeaponOption[]>((accumulator, weapon) => {
        if (weapon.type === forcedType) {
          accumulator.push(weaponToOption(weapon));
        }
        return accumulator;
      }, []);
    }

    return weapons.map(weaponToOption);
  }, []);

  const [selectReady, setSelectReady] = useState(!!forcedType);
  const [weaponConfig, setWeaponConfig] = useState<Weapon>();
  const [hiddenCodes, setHiddenCodes] = useState(
    new Set(forcedType ? [] : weaponOptions.map((weapon) => weapon.code))
  );

  const handleConfirmFilter = (filter: WeaponFilterState) => {
    const newHiddenCodes = new Set<number>();
    const typeFiltered = filter.types.length !== 0;
    const rarityFiltered = filter.rarities.length !== 0;

    weaponOptions.forEach((weapon) => {
      if (
        (typeFiltered && !filter.types.includes(weapon.type)) ||
        (rarityFiltered && !filter.rarities.includes(weapon.rarity))
      ) {
        newHiddenCodes.add(weapon.code);
      }
    });
    setHiddenCodes(newHiddenCodes);
    filterRef.current = filter;

    if (!selectReady) setSelectReady(true);
  };

  const handleSelectChange: AppEntitySelectProps<WeaponOption>["onChange"] = (
    mold,
    isConfigStep
  ) => {
    if (mold) {
      const weapon = createWeapon(mold, mold.data);

      if (isConfigStep) {
        setWeaponConfig(weapon);
      } else {
        onForgeWeapon(weapon);
      }
    } else {
      setWeaponConfig(undefined);
    }

    return true;
  };

  return (
    <AppEntitySelect
      title={<p className="text-base sm:text-xl leading-7">Weapon Forge</p>}
      data={weaponOptions}
      hiddenCodes={hiddenCodes}
      emptyText="No weapons found"
      hasSearch
      hasFilter
      initialFilterOn={!forcedType}
      filterToggleable={selectReady}
      filterWrapWidth={300}
      renderFilter={(setFilterOn) => {
        return (
          <WeaponFilter
            className="h-full"
            withTypeSelect={!forcedType}
            initialFilter={filterRef.current}
            disabledCancel={!selectReady}
            onCancel={() => setFilterOn(false)}
            onConfirm={(newFilter) => {
              handleConfirmFilter(newFilter);
              setFilterOn(false);
            }}
          />
        );
      }}
      renderOptionConfig={(afterSelect, selectBody) => {
        return (
          <WeaponCard
            wrapperCls="w-76 h-full"
            mutable
            weapon={weaponConfig}
            refine={(refi, config) => {
              setWeaponConfig(new Weapon({ ...config, refi }, config.data));
            }}
            upgrade={(level, config) => {
              setWeaponConfig(new Weapon({ ...config, level }, config.data));
            }}
            actions={[
              {
                icon: <FancyBackSvg />,
                className: "sm:hidden",
                onClick: () => {
                  if (selectBody) selectBody.scrollLeft = 0;
                },
              },
              {
                children: "Forge",
                variant: "primary",
                onClick: (_, config) => {
                  onForgeWeapon(new Weapon(config, config.data));
                  afterSelect(config.code);
                },
              },
            ]}
          />
        );
      }}
      onChange={handleSelectChange}
      onClose={onClose}
      {...templateProps}
    />
  );
}

export const WeaponForge = Modal.coreWrap(WeaponSmith, { preset: "large" });
