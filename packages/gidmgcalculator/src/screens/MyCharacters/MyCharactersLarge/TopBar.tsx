import { useEffect } from "react";
import { FaPlus, FaSortAmountUpAlt } from "react-icons/fa";
import { Button, clsx, useChildListObserver, useIntersectionObserver } from "rond";

import { GenshinImage } from "@/components";
import { $AppCharacter } from "@/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveCharacter, selectDbCharacters, viewDbCharacter } from "@Store/userdb-slice";
import { useMyCharactersModalCtrl } from "../ContextProvider";

export function TopBar() {
  const dispatch = useDispatch();
  const characters = useSelector(selectDbCharacters);
  const activeChar = useSelector(selectActiveCharacter);
  const modalCtrl = useMyCharactersModalCtrl();

  const { observedAreaRef: intersectObsArea, visibleMap, itemUtils } = useIntersectionObserver();
  const { observedAreaRef: listObsArea } = useChildListObserver({
    onNodesAdded(addedNodes) {
      addedNodes.forEach((node) => itemUtils.observe(node as Element));
    },
    onNodesRemoved(removedNodes) {
      removedNodes.forEach((node) => itemUtils.observe(node as Element));
    },
  });

  const scrollList = (code: number) => {
    itemUtils.queryById(code)?.element.scrollIntoView();
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
    scrollList(activeChar);
  }, [activeChar]);

  return (
    <div className="w-full flex justify-center bg-dark-2">
      <div className="relative w-full max-w-60/100 xm:max-w-70/100">
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
            {characters.map(({ code }) => {
              const appCharacter = $AppCharacter.get(code);
              if (!appCharacter) return null;
              const visible = visibleMap[code];

              return (
                <div
                  key={code}
                  data-selected={code === activeChar}
                  {...itemUtils.getProps(
                    code,
                    "mx-1 border-b-3 border-transparent cursor-pointer group/cell data-[selected=true]/cell:border-link"
                  )}
                  onClick={() => dispatch(viewDbCharacter(code))}
                >
                  <div
                    className={clsx(
                      "size-15 min-w-15 rounded-circle border-3 border-light-1/30 bg-black/30",
                      "group-data-[selected=true]/cell:border-link group-data-[selected=true]/cell:bg-link",
                      appCharacter.sideIcon ? "m-2" : "m-1 overflow-hidden"
                    )}
                  >
                    <div
                      data-visible={visible}
                      className="w-ful h-full transition-opacity duration-400 opacity-0 data-[visible=true]:opacity-100"
                    >
                      {visible && (
                        <GenshinImage
                          src={appCharacter.sideIcon || appCharacter.icon}
                          alt="icon"
                          imgCls={`max-w-none ${
                            appCharacter.sideIcon
                              ? "w-[85px] translate-x-[-15px] translate-y-[-32px]"
                              : "w-15 translate-x-[-2.5px] translate-y-0"
                          }`}
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

        <div className="absolute top-4 left-full ml-6">
          <Button
            variant="custom"
            size="custom"
            className="size-15 bg-dark-3"
            icon={<FaPlus className="text-2xl" />}
            onClick={modalCtrl.requestAddCharacter}
          />
        </div>
      </div>
    </div>
  );
}
