import { useState } from "react";
import { FaExpandArrowsAlt } from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";
import { BiDetail } from "react-icons/bi";
import { useClickOutside, Modal, CloseButton } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

export function Menu(props: { calcResultRender: React.ReactNode }) {
  const dispatch = useDispatch();

  const [menuDropped, setMenuDropped] = useState(false);
  const [resultsEnlarged, setResultsEnlarged] = useState(false);

  const wrapperRef = useClickOutside<HTMLDivElement>(() => setMenuDropped(false));

  const menuItems = [
    {
      icon: BiDetail,
      text: "Tracker",
      className: "flex hover:bg-primary-1",
      onClick: () => {
        dispatch(updateUI({ trackerState: "open" }));
      },
    },
    {
      icon: FaExpandArrowsAlt,
      text: "Expand",
      className: "hover:bg-primary-1 hidden xm:flex",
      onClick: () => setResultsEnlarged(true),
    },
  ];

  const closeEnlargedView = () => {
    setResultsEnlarged(false);
  };

  return (
    <div ref={wrapperRef} className="absolute top-2 right-2 w-8">
      <button
        className={"w-8 h-8 flex-center rounded-md text-2xl" + (menuDropped ? " bg-active text-black" : "")}
        onClick={() => setMenuDropped(!menuDropped)}
      >
        <MdMoreVert />
      </button>

      <div
        className={
          "absolute right-0 z-10 mt-1 rounded bg-light-1 text-black hide-scrollbar" +
          (menuDropped ? "" : " max-h-0")
        }
      >
        <div className="py-1 flex flex-col">
          {menuItems.map((item, i) => {
            return (
              <span
                key={i}
                className={"px-2 py-1 items-center font-medium cursor-default " + (item.className || "")}
                onClick={() => {
                  item.onClick();
                  setMenuDropped(false);
                }}
              >
                <item.icon />
                <span className="ml-2">{item.text}</span>
              </span>
            );
          })}
        </div>
      </div>

      <Modal.Core
        active={resultsEnlarged}
        className={[Modal.LARGE_HEIGHT_CLS, "p-4 pt-2 rounded-lg shadow-popup bg-dark-3"]}
        onClose={closeEnlargedView}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeEnlargedView} />
        {props.calcResultRender}
      </Modal.Core>
    </div>
  );
}
