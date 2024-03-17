import clsx from "clsx";
import { ChangeEvent, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import type { ElementType, AppMonster } from "@Src/types";
import { toArray } from "@Src/utils";
import { $AppData } from "@Src/services";

interface ComboBoxProps {
  className: string;
  targetCode: number;
  targetTitle: string;
  onSelectMonster: (args: { monsterCode: number; inputs: number[]; variantType?: ElementType }) => void;
}
export const ComboBox = ({ className, targetCode, targetTitle, onSelectMonster }: ComboBoxProps) => {
  const [keyword, setKeyword] = useState("");

  const onFocusSearchInput = () => {
    document.querySelector(`#monster-${targetCode}`)?.scrollIntoView();
  };

  const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);

    const monsterList = document.querySelector("#monster-list");

    if (monsterList) {
      monsterList.scrollTop = 0;
    }
  };

  const onClickMonster = (monster: AppMonster) => () => {
    if (monster.code !== targetCode) {
      let newVariantType;
      let newInputs = monster.inputConfigs
        ? toArray(monster.inputConfigs).map((config) => (config.type === "select" ? -1 : 0))
        : [];

      if (monster.variant) {
        const firstVariant = monster.variant.types[0];
        newVariantType = typeof firstVariant === "string" ? firstVariant : firstVariant.value;
      }

      setKeyword("");

      onSelectMonster({
        monsterCode: monster.code,
        inputs: newInputs,
        variantType: newVariantType,
      });
    }

    (document.activeElement as HTMLInputElement)?.blur();
  };

  return (
    <div className={"relative " + (className || "")}>
      <label className="px-2 w-full text-black bg-light-400 rounded font-semibold flex items-center peer">
        <input
          className="p-2 bg-transparent grow font-bold placeholder:text-black focus:placeholder:text-rarity-1"
          placeholder={targetTitle}
          value={keyword}
          maxLength={10}
          onFocus={onFocusSearchInput}
          onBlur={() => setKeyword("")}
          onChange={onChangeSearchInput}
        />
        <FaChevronDown />
      </label>

      <div
        id="monster-list"
        className="absolute top-full z-10 mt-1 w-full text-black bg-light-400 custom-scrollbar cursor-default hidden peer-focus-within:block"
        style={{ maxHeight: "50vh" }}
      >
        {$AppData.getAllMonsters().map((monster, i) => {
          if (
            keyword &&
            !monster.title.toLowerCase().includes(keyword) &&
            (!monster.names || monster.names.every((name) => !name.toLowerCase().includes(keyword)))
          ) {
            return null;
          }

          return (
            <div
              key={monster.code}
              id={`monster-${monster.code}`}
              className={clsx(
                "px-2 py-1 flex flex-col font-semibold",
                monster.code === targetCode ? "bg-light-800" : "hover:text-light-400 hover:bg-dark-500 hover:font-bold"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClickMonster(monster)}
            >
              <p>{monster.title}</p>
              {monster.subtitle && <p className="text-sm italic">* {monster.subtitle}</p>}
              {monster.names?.length && <p className="text-sm italic">{monster.names.join(", ")}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
