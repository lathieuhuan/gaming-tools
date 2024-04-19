import { useState } from "react";
import { useDispatch } from "react-redux";
import { MdInventory } from "react-icons/md";
import { Badge, Button, VersatileSelect } from "rond";

import type { Level } from "@Src/types";
import { LEVELS } from "@Src/constants";
import { $AppData } from "@Src/services";
import { Item_, genSequentialOptions } from "@Src/utils";
import { selectWeapon, changeWeapon, updateWeapon } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { WeaponForge, WeaponInventory, GenshinImage } from "@Src/components";

import styles from "../SetupManager.styles.module.scss";

type ModalType = "MAKE_NEW_WEAPON" | "SELECT_USER_WEAPON" | "";

export default function SectionWeapon() {
  const dispatch = useDispatch();
  const weapon = useSelector(selectWeapon);
  const [modalType, setModalType] = useState<ModalType>("");

  const { beta, name = "", icon = "", rarity = 5 } = $AppData.getWeapon(weapon.code) || {};
  const selectLevels = rarity < 3 ? LEVELS.slice(0, -4) : LEVELS;

  const closeModal = () => setModalType("");

  return (
    <div className={"px-2 py-3 bg-surface-1 flex items-start relative " + styles.section}>
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

        <div className="flex items-center flex-wrap">
          <p className="mr-1">Level</p>
          <VersatileSelect
            title="Select Level"
            className={`w-18 text-rarity-${rarity} font-medium`}
            transparent
            align="right"
            disabled={name === ""}
            options={selectLevels.map((_, i) => {
              const item = selectLevels[selectLevels.length - 1 - i];
              return { label: item, value: item };
            })}
            value={weapon.level}
            onChange={(value) => dispatch(updateWeapon({ level: value as Level }))}
          />
        </div>

        {rarity >= 3 && (
          <div className="flex items-center flex-wrap">
            <p className="mr-1">Refinement</p>
            <VersatileSelect
              title="Select Refinement"
              className={`w-10 text-rarity-${rarity} font-medium`}
              transparent
              align="right"
              disabled={name === ""}
              options={genSequentialOptions(5)}
              value={weapon.refi}
              onChange={(value) => dispatch(updateWeapon({ refi: +value }))}
            />
          </div>
        )}
      </div>

      <Button
        title="Inventory"
        className="absolute bottom-1 right-1"
        size="large"
        boneOnly
        icon={<MdInventory />}
        onClick={() => setModalType("SELECT_USER_WEAPON")}
      />

      <WeaponForge
        active={modalType === "MAKE_NEW_WEAPON"}
        forcedType={weapon.type}
        onForgeWeapon={(weapon) => {
          dispatch(
            changeWeapon({
              ...weapon,
              ID: Date.now(),
            })
          );
        }}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "SELECT_USER_WEAPON"}
        weaponType={weapon.type}
        buttonText="Select"
        onClickButton={(weapon) => {
          dispatch(changeWeapon(Item_.userItemToCalcItem(weapon)));
        }}
        onClose={closeModal}
      />
    </div>
  );
}
