import { useState } from "react";
import { Badge, Button, PouchSvg, VersatileSelect } from "rond";

import { WEAPON_LEVELS } from "@/constants";
import { $AppWeapon } from "@/services";
import { Level } from "@/types";
import { genSequentialOptions } from "@/utils";
import { useCalcStore } from "@Store/calculator";
import { updateMainWeapon } from "@Store/calculator/actions";
import { selectActiveMain } from "@Store/calculator/selectors";

import { GenshinImage, WeaponForge, WeaponForgeProps, WeaponInventory } from "@/components";
import { Section } from "../_components/Section";

type ModalType = "MAKE_NEW_WEAPON" | "SELECT_USER_WEAPON" | "";

export default function SectionWeapon() {
  const weapon = useCalcStore((state) => selectActiveMain(state).weapon);
  const [modalType, setModalType] = useState<ModalType>("");

  const { beta, name = "", icon = "", rarity = 5 } = $AppWeapon.get(weapon.code) || {};
  const selectLevels = rarity < 3 ? WEAPON_LEVELS.slice(0, -4) : WEAPON_LEVELS;
  const levelOptions = selectLevels.map((_, i) => {
    const item = selectLevels[selectLevels.length - 1 - i];
    return { label: item, value: item };
  });

  const closeModal = () => setModalType("");

  const handleForgeWeapon: WeaponForgeProps["onForgeWeapon"] = (weapon) => {
    updateMainWeapon({
      ...weapon,
      ID: Date.now(),
    });
  };

  return (
    <Section
      className="px-2 py-3 bg-dark-1 flex items-start relative"
      onDoubleClick={() => console.log(weapon)}
    >
      <div
        className={`w-20 h-20 shrink-0 relative bg-gradient-${rarity} cursor-pointer rounded-md`}
        onClick={() => setModalType("MAKE_NEW_WEAPON")}
      >
        <GenshinImage src={icon} alt={name} imgType="weapon" />
        <Badge active={beta} className="absolute -top-1 -left-1">
          BETA
        </Badge>
      </div>

      <div className="ml-2 overflow-hidden space-y-1">
        <p className={`text-xl text-rarity-${rarity} font-bold text-ellipsis`}>{name}</p>

        <div className="pl-1 flex items-center flex-wrap">
          <p className="mr-1">Level</p>
          <VersatileSelect
            title="Select Level"
            className={`w-18 text-rarity-${rarity} font-medium`}
            transparent
            align="right"
            disabled={name === ""}
            options={levelOptions}
            value={weapon.level}
            onChange={(value) => updateMainWeapon({ level: value as Level })}
          />
        </div>

        {rarity >= 3 && (
          <div className="pl-1 flex items-center flex-wrap">
            <p className="mr-1">Refinement</p>
            <VersatileSelect
              title="Select Refinement"
              className={`w-10 text-rarity-${rarity} font-medium`}
              transparent
              align="right"
              disabled={name === ""}
              options={genSequentialOptions(5)}
              value={weapon.refi}
              onChange={(value) => updateMainWeapon({ refi: +value })}
            />
          </div>
        )}
      </div>

      <Button
        title="Inventory"
        className="absolute bottom-1 right-1"
        boneOnly
        icon={<PouchSvg className="text-xl" />}
        onClick={() => setModalType("SELECT_USER_WEAPON")}
      />

      <WeaponForge
        active={modalType === "MAKE_NEW_WEAPON"}
        forcedType={weapon.type}
        onForgeWeapon={handleForgeWeapon}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "SELECT_USER_WEAPON"}
        weaponType={weapon.type}
        buttonText="Select"
        onClickButton={updateMainWeapon}
        onClose={closeModal}
      />
    </Section>
  );
}
