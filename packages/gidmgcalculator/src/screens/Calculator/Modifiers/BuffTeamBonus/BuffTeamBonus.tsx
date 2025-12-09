import { Fragment } from "react";

import { useResonanceCtrlGroup } from "./_hooks/useResonanceCtrlGroup";
import { useTeamBuffCtrlGroup } from "./_hooks/useTeamBuffCtrlGroup";
// import { GenshinModifierView } from "@/components";

// const SECRET_RITE_DESCRIPTION = (
//   <>
//     When the party has at least 2 members with Witch's Buff, Magic: Secret Rite is granted,
//     enhancing members under the buff.
//   </>
// );

export function BuffTeamBonus() {
  const groups = [useResonanceCtrlGroup(), useTeamBuffCtrlGroup()];

  // if (teamDate.witchRiteLv === 2) {
  //   groups.push({
  //     isEmpty: false,
  //     key: "witch-rite",
  //     render: () => (
  //       <div>
  //         <GenshinModifierView
  //           mutable={false}
  //           heading="Magic: Secret Rite"
  //           description={SECRET_RITE_DESCRIPTION}
  //         />
  //       </div>
  //     ),
  //   });
  // }

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
