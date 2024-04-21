import { useEffect } from "react";
import { FaPlus, FaSortAmountUpAlt } from "react-icons/fa";
import { clsx, useIntersectionObserver, Button, useChildListObserver } from "rond";

import { GenshinImage } from "@Src/components";
import { $AppCharacter } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectChosenCharacter, selectUserCharacters, viewCharacter } from "@Store/userdb-slice";
import { useMyCharactersModalCtrl } from "../MyCharactersModalsProvider";

import styles from "./MyCharactersLarge.styles.module.scss";

export function MyCharactersTopBar() {
  const dispatch = useDispatch();
  const characters = useSelector(selectUserCharacters);
  const chosenChar = useSelector(selectChosenCharacter);
  const modalCtrl = useMyCharactersModalCtrl();

  const { observedAreaRef: intersectObsArea, visibleMap, itemUtils } = useIntersectionObserver();
  const { observedAreaRef: listObsArea } = useChildListObserver({
    onNodesAdded: (addedNodes) => {
      for (const node of addedNodes) {
        itemUtils.observe(node as Element);
      }
    },
  });

  const appCharacters = $AppCharacter.getAll();

  const scrollList = (name: string) => {
    itemUtils.queryById(name)?.element.scrollIntoView();
  };

  useEffect(() => {
    const scrollHorizontally = (e: any) => {
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));

      if (intersectObsArea.current) {
        intersectObsArea.current.scrollLeft -= delta * 50;
      }
      e.preventDefault();
    };

    intersectObsArea.current?.addEventListener("wheel", scrollHorizontally);

    return () => {
      intersectObsArea.current?.removeEventListener("wheel", scrollHorizontally);
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
            <Button
              className="mr-4"
              variant="primary"
              icon={<FaSortAmountUpAlt />}
              onClick={modalCtrl.requestSortCharacters}
            />
          </div>
        ) : null}

        <div ref={intersectObsArea} className="mt-2 w-full h-20 hide-scrollbar">
          <div ref={listObsArea} className="flex">
            {characters.map(({ name }) => {
              const appChar = appCharacters.find((appChar) => appChar.name === name);
              if (!appChar) return null;
              const visible = visibleMap[name];

              return (
                <div
                  key={name}
                  {...itemUtils.getProps(name, [
                    "mx-1 border-b-3 border-transparent cursor-pointer",
                    name === chosenChar && styles["active-cell"],
                  ])}
                  onClick={() => dispatch(viewCharacter(name))}
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
                      {visible && <GenshinImage src={appChar.sideIcon || appChar.icon} alt="icon" fallbackCls="p-2" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute top-4 left-full ml-6">
          <Button
            variant="custom"
            size="custom"
            className="w-full h-full bg-surface-3"
            style={{ width: "3.75rem", height: "3.75rem" }}
            icon={<FaPlus className="text-2xl" />}
            onClick={modalCtrl.requestAddCharacter}
          />
        </div>
      </div>
    </div>
  );
}
