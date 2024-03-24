import { useEffect, useState } from "react";
import { FaSortAmountUpAlt, FaTh, FaPlus } from "react-icons/fa";
import { clsx, useIntersectionObserver, Button } from "rond";

import { $AppCharacter } from "@Src/services";
import { useDispatch } from "@Store/hooks";
import { chooseCharacter } from "@Store/userdb-slice";
import { GenshinImage, Tavern } from "@Src/components";

import styles from "./MyCharacters.styles.module.scss";

interface TopBarProps {
  characters: Array<{ name: string }>;
  chosenChar: string;
  onClickSort: () => void;
  onClickWish: () => void;
}
export default function CharacterList({ characters, chosenChar, onClickSort, onClickWish }: TopBarProps) {
  const dispatch = useDispatch();

  const [gridviewOn, setGridviewOn] = useState(false);
  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver({
    dependecies: [characters],
  });

  const scrollList = (name: string) => {
    itemUtils.queryById(name)?.element.scrollIntoView();
  };

  useEffect(() => {
    const scrollHorizontally = (e: any) => {
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));

      if (observedAreaRef.current) {
        observedAreaRef.current.scrollLeft -= delta * 50;
      }
      e.preventDefault();
    };

    observedAreaRef.current?.addEventListener("wheel", scrollHorizontally);

    return () => {
      observedAreaRef.current?.removeEventListener("wheel", scrollHorizontally);
    };
  }, []);

  useEffect(() => {
    scrollList(chosenChar);
  }, [chosenChar]);

  return (
    <div className="w-full flex justify-center bg-surface-2">
      <div className={styles["side-icon-carousel"]}>
        {characters.length ? (
          <div className="absolute top-8 right-full flex">
            <Button className="mr-4" variant="primary" icon={<FaSortAmountUpAlt />} onClick={onClickSort} />
            <Button className="mr-4" variant="primary" icon={<FaTh />} onClick={() => setGridviewOn(true)} />
          </div>
        ) : null}

        <div ref={observedAreaRef} className="mt-2 w-full h-20 hide-scrollbar">
          <div className="flex">
            {characters.map(({ name }) => {
              const appChar = $AppCharacter.get(name);
              if (!appChar) return null;
              const visible = visibleMap[name];

              return (
                <div
                  key={name}
                  {...itemUtils.getProps(name, [
                    "mx-1 border-b-3 border-transparent cursor-pointer",
                    name === chosenChar && styles["active-cell"],
                  ])}
                  onClick={() => dispatch(chooseCharacter(name))}
                >
                  <div
                    className={clsx(
                      "rounded-circle border-3 border-light-default/30 bg-black/30",
                      styles["icon-wrapper"],
                      appChar.sideIcon
                        ? `m-2 ${styles["side-icon-wrapper"]}`
                        : `m-1 overflow-hidden ${styles["beta-icon-wrapper"]}`
                    )}
                  >
                    <div
                      className={
                        "w-ful h-full transition-opacity duration-400 " + (visible ? "opacity-100" : "opacity-0")
                      }
                    >
                      {visible && (
                        <GenshinImage
                          src={appChar.sideIcon || appChar.icon}
                          alt="icon"
                          fallbackCls="p-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          variant="custom"
          size="custom"
          className="absolute top-4 left-full ml-6 bg-surface-3 text-2xl"
          style={{ width: 60, height: 60 }}
          icon={<FaPlus />}
          onClick={onClickWish}
        />
      </div>

      <Tavern
        active={gridviewOn}
        sourceType="user"
        onSelectCharacter={(character) => {
          dispatch(chooseCharacter(character.name));
          scrollList(character.name);
        }}
        onClose={() => setGridviewOn(false)}
      />
    </div>
  );
}
