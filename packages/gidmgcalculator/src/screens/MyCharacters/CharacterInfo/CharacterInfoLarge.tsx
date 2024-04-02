import { HiddenSpace } from "rond";

import type { Character } from "@Src/types";
import { useDispatch } from "@Store/hooks";
import { updateUserCharacter } from "@Store/userdb-slice";

// Component
import { ConstellationList, TalentList } from "@Src/components";
import { PanelAttributes } from "./PanelAttributes";
import { PanelGears } from "./PanelGears";

interface CharacterInfoLargeProps {
  char: Character;
}
export function CharacterInfoLarge({ char }: CharacterInfoLargeProps) {
  const dispatch = useDispatch();

  const sectionCls = "p-4 rounded-lg bg-surface-1";

  return (
    <div className="h-full flex-center">
      <div className="py-4 flex h-98/100 space-x-2 custom-scrollbar" style={{ width: "92%" }}>
        <div className={sectionCls}>
          <PanelAttributes className="w-76" />
        </div>

        <PanelGears>
          {({ detailActive, renderGearsOverview, renderGearsDetail, removeDetail }) => {
            return (
              <div className="h-full flex">
                <div className={sectionCls}>
                  <div className="h-full hide-scrollbar">{renderGearsOverview({ className: "w-76" })}</div>
                </div>
                <HiddenSpace active={detailActive} className="py-2 flex" afterClose={removeDetail}>
                  <div className={`${sectionCls} w-76 h-full ml-px rounded-l-none`}>{renderGearsDetail()}</div>
                </HiddenSpace>
              </div>
            );
          }}
        </PanelGears>

        <div className={sectionCls}>
          <ConstellationList
            className="w-76"
            char={char}
            onClickIcon={(i) => {
              dispatch(
                updateUserCharacter({
                  name: char.name,
                  cons: char.cons === i + 1 ? i : i + 1,
                })
              );
            }}
          />
        </div>

        <div className={sectionCls}>
          <TalentList
            className="w-76"
            char={char}
            onChangeTalentLevel={(type, level) => {
              dispatch(updateUserCharacter({ name: char.name, [type]: level }));
            }}
          />
        </div>
      </div>
    </div>
  );
}
