import { clsx } from "rond";
import { ChangeEvent, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import type { ElementType, AppMonster } from "@/types";

import Array_ from "@/utils/Array";
import { $AppData } from "@/services";

const LIST_ID = "monster-list";

type ComboBoxProps = {
  className: string;
  targetCode: number;
  targetTitle: string;
  onSelectMonster: (args: {
    monsterCode: number;
    inputs: number[];
    variantType?: ElementType;
  }) => void;
};

export function ComboBox({ className, targetCode, targetTitle, onSelectMonster }: ComboBoxProps) {
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFocusSearchInput = () => {
    document.querySelector(`#monster-${targetCode}`)?.scrollIntoView();
  };

  const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);

    const monsterList = document.querySelector(`#${LIST_ID}`);

    if (monsterList) {
      monsterList.scrollTop = 0;
    }
  };

  const onClickMonster = (monster: AppMonster) => () => {
    if (monster.code !== targetCode) {
      let newVariantType;
      const newInputs = monster.inputConfigs
        ? Array_.toArray(monster.inputConfigs).map((config) => (config.type === "SELECT" ? -1 : 0))
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

    inputRef.current?.blur();
  };

  return (
    <div className={"relative " + (className || "")}>
      <label className="px-2 w-full text-black bg-light-1 rounded flex items-center peer">
        <input
          ref={inputRef}
          className="py-1 bg-transparent grow font-semibold placeholder:text-black focus:placeholder:text-light-hint"
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
        id={LIST_ID}
        className="absolute top-full z-10 mt-1 w-full text-black bg-light-1 custom-scrollbar cursor-default hidden peer-focus-within:block"
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
                monster.code === targetCode ? "bg-light-4" : "hover:bg-primary-1"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClickMonster(monster)}
            >
              <p>{monster.title}</p>
              {monster.subtitle && <p className="text-sm italic">* {monster.subtitle}</p>}
              {monster.names?.length && (
                <p className="text-sm italic">{monster.names.join(", ")}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
