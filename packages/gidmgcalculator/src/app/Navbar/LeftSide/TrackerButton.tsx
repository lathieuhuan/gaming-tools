import { useDispatch, useSelector } from "@Store/hooks";
import { BiDetail } from "react-icons/bi";

import { updateUI } from "@Store/ui-slice";

export function TrackerButton() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);

  if (trackerState !== "close") {
    const onClick = () => {
      dispatch(updateUI({ trackerState: "open" }));
    };

    return (
      <button className="w-8 h-8 flex-center bg-dark-3 glow-on-hover" onClick={onClick}>
        <BiDetail className="text-xl" />
      </button>
    );
  }

  return null;
}
