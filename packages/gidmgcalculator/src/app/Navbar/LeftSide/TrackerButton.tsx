import { BiDetail } from "react-icons/bi";

import { updateUI, useUIStore } from "@Store/ui";

export function TrackerButton() {
  const trackerState = useUIStore((state) => state.trackerState);

  if (trackerState !== "close") {
    const onClick = () => {
      updateUI({ trackerState: "open" });
    };

    return (
      <button className="w-8 h-8 flex-center bg-dark-3 glow-on-hover" onClick={onClick}>
        <BiDetail className="text-xl" />
      </button>
    );
  }

  return null;
}
