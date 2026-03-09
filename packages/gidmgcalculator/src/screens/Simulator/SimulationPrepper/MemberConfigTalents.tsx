import { clsx, VersatileSelect } from "rond";

import type { Character } from "@/models";

import { LEVELABLE_TALENT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { genSequentialOptions } from "@/utils/pure.utils";
import { updateMember } from "./actions";

type MemberConfigTalentsProps = {
  className?: string;
  character: Character;
};

export function MemberConfigTalents({ className, character }: MemberConfigTalentsProps) {
  const { t } = useTranslation();

  const { data } = character;

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {LEVELABLE_TALENT_TYPES.map((talentType) => {
        const talent = data.activeTalents[talentType];

        return (
          <div key={talentType} className="px-3 pt-2 pb-1 bg-dark-2 rounded">
            <div className="flex items-center">
              <p className="pr-2 font-bold truncate">{talent.name}</p>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-light-hint">{t(talentType)}</span>

              <span className="ml-auto mr-1">Lv.</span>
              <VersatileSelect
                title="Select Level"
                className={`w-12 text-${data.vision} font-bold`}
                transparent
                showAllOptions
                value={character[talentType]}
                options={genSequentialOptions(10)}
                onChange={(value) => updateMember(data.code, talentType, +value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
