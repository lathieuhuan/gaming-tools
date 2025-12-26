import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { clsx } from "rond";

import type { ITeammate } from "@/types";
import { CharacterPortrait } from "@/components";

type TeammateSlotProps = {
  active: boolean;
  teammate: ITeammate;
  onSelect: () => void;
  onRemove: () => void;
  onRequestChange: () => void;
};

export function TeammateSlot({
  active,
  teammate,
  onSelect,
  onRemove,
  onRequestChange,
}: TeammateSlotProps) {
  const { data } = teammate;
  const buttonClass = clsx("w-10 h-10 glow-on-hover", active ? "flex-center" : "hidden");

  return (
    <div className="h-21 flex flex-col items-center">
      <div
        className={clsx(
          "flex items-end text-xl shrink-0 overflow-hidden transition-all",
          active ? "h-11" : "h-3"
        )}
      >
        <button className={buttonClass} onClick={onRemove}>
          <FaUserSlash />
        </button>

        <button className={buttonClass} onClick={onRequestChange}>
          <FaSyncAlt />
        </button>
      </div>

      <CharacterPortrait info={data} withColorBg recruitable onClick={onSelect} />
    </div>
  );
}
