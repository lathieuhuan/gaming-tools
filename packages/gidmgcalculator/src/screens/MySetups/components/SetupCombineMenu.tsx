import { clsx, EmptyFallback } from "rond";

import type { DbSetup } from "@/types";

import { CharacterPortrait } from "@/components/CharacterPortrait";
import { getAppCharacter } from "@/services/app-data";

type SetupCombineMenuProps = {
  className?: string;
  setups: DbSetup[];
  pickedIds: number[];
  limit: number;
  onChange: (pickedIds: number[]) => void;
};

export function SetupCombineMenu({
  className,
  setups,
  pickedIds,
  limit,
  onChange,
}: SetupCombineMenuProps) {
  const isEnough = pickedIds.length >= limit;

  const onClickOption = (id: number, picked: boolean) => {
    if (picked) {
      const newIds = pickedIds.filter((pickedId) => pickedId !== id);
      onChange(newIds);
    } //
    else if (!isEnough) {
      const newIds = [...pickedIds, id];
      onChange(newIds);
    }
  };

  return (
    <EmptyFallback
      containerCls={className}
      className="space-y-3"
      messageCls="text-lg leading-40"
      message="No setups available for choosing..."
    >
      {setups.map((setup) => {
        const { ID } = setup;
        const picked = pickedIds.includes(ID);

        return (
          <div
            key={ID}
            className={clsx(
              "p-4 rounded-lg bg-dark-1 flex flex-col md:flex-row inset-shadow-hightlight-1",
              !picked && isEnough && "opacity-50",
              picked && "shadow-bonus",
            )}
            onClick={() => onClickOption(ID, picked)}
          >
            <div className="md:w-40 md:mr-4">
              <p className="text-lg font-semibold text-secondary-1 cursor-default">{setup.name}</p>
            </div>

            <div className="mt-2 md:mt-0 flex gap-4">
              <CharacterPortrait
                className="shadow-hightlight-2 shadow-light-1"
                size="small"
                info={getAppCharacter(setup.main.code)}
              />
              {setup.teammates.map((teammate, j) => {
                return (
                  <CharacterPortrait key={j} size="small" info={getAppCharacter(teammate.code)} />
                );
              })}
            </div>
          </div>
        );
      })}
    </EmptyFallback>
  );
}
