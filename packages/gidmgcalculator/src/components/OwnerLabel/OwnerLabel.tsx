import { FaPuzzlePiece } from "react-icons/fa";
import { cn, Popover } from "rond";

import type { RawArtifact, RawWeapon } from "@/types";

import { getAppCharacter } from "@/services/app-data";
import { useItemBoundSetups } from "./useItemBoundSetups";

type OwnerLabelProps = React.ComponentProps<"div"> & {
  item?: RawArtifact | RawWeapon;
};

export function OwnerLabel({ className, item, ...restProps }: OwnerLabelProps) {
  const containingSetups = useItemBoundSetups(item);

  const handleMouseDown = ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => {
    if (currentTarget.matches(":focus")) {
      setTimeout(() => {
        currentTarget.blur();
      }, 100);
    }
  };

  const classNames = [
    "pl-4 rounded-sm font-bold bg-primary-2 text-black flex justify-between relative",
    className,
  ];

  if (!item) {
    return <div className={cn("h-8", classNames)} {...restProps} />;
  }

  const ownerName = item.owner ? getAppCharacter(item.owner)?.name : undefined;

  return (
    <div className={cn(classNames)} {...restProps}>
      <p className="py-1">Equipped: {ownerName || <span className="opacity-80">None</span>}</p>

      {containingSetups.length !== 0 && (
        <>
          <button className="w-8 h-8 flex-center peer" onMouseDown={handleMouseDown}>
            <FaPuzzlePiece className="w-5 h-5" />
          </button>

          <Popover
            className="bottom-full right-2 mb-2 shadow-popup scale-0 peer-focus:scale-100"
            withTooltipStyle
          >
            <div className="px-4 py-2 flex flex-col overflow-auto">
              <p className="text-heading font-medium">This item is used on these setups:</p>
              <ul className="mt-1 pl-4 list-disc font-semibold overflow-auto custom-scrollbar">
                {containingSetups.map((setup, i) => {
                  return <li key={i}>{setup.name}</li>;
                })}
              </ul>
            </div>
          </Popover>
        </>
      )}
    </div>
  );
}
