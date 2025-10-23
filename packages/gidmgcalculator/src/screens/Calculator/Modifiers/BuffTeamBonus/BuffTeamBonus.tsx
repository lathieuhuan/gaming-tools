import { Fragment } from "react";

import { useResonanceCtrlGroup } from "./_hooks/useResonanceCtrlGroup";
import { useTeamBuffCtrlGroup } from "./_hooks/useTeamBuffCtrlGroup";

export function BuffTeamBonus() {
  const groups = [useResonanceCtrlGroup(), useTeamBuffCtrlGroup()];

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
