import { Fragment } from "react";

import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { useResonanceCtrlGroup } from "./_hooks/useResonanceCtrlGroup";
import { useTeamBuffCtrlGroup } from "./_hooks/useTeamBuffCtrlGroup";

import { GenshinModifierView } from "@/components";
import { SECRET_RITE_BUFF_CONFIG } from "@/components/modifier-item/configs";

export function BuffTeamBonus() {
  const team = useCalcStore((state) => selectSetup(state).team);
  const groups = [useResonanceCtrlGroup(team), useTeamBuffCtrlGroup()];

  if (team.witchRiteLv === 2) {
    groups.push({
      isEmpty: false,
      key: "witch-rite",
      render: () => <GenshinModifierView mutable={false} {...SECRET_RITE_BUFF_CONFIG} />,
    });
  }

  if (groups.every((group) => group.isEmpty)) {
    return <div className="py-4 text-center text-hint-color">No buffs found.</div>;
  }

  return (
    <div className="pt-2 peer">
      {groups
        .filter((group) => !group.isEmpty)
        .map((group, index) => (
          <Fragment key={group.key}>
            {index ? <div className="mx-auto my-3 w-1/2 h-px bg-surface-3" /> : null}
            {group.render("space-y-3")}
          </Fragment>
        ))}
    </div>
  );
}
