import { clsx, VersatileSelect } from "rond";

import { LEVELABLE_TALENT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { Member } from "@/models/Member";
import { genSequentialOptions } from "@/utils/pure.utils";
import { updateMemberState } from "../actions/prepare";

type MemberConfigTalentsProps = {
  className?: string;
  member: Member;
};

export function MemberConfigTalents({ className, member }: MemberConfigTalentsProps) {
  const { t } = useTranslation();

  const { data } = member;

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
                value={member[talentType]}
                options={genSequentialOptions(10)}
                onChange={(value) => updateMemberState(data.code, { [talentType]: +value })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
