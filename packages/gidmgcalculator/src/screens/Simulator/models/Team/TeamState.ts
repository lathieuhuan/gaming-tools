import type { Member } from "@/models/Member";
import type { AutoRsnElmtType, ElementCount } from "@/types";

import { isAutoRsnElmt } from "@/logic/element.logic";
import TypeCounter from "@/utils/TypeCounter";

export class TeamState {
  resonances: AutoRsnElmtType[] = [];
  moonsignLv: number = 0;
  witchRiteLv: number = 0;
  elmtCount: ElementCount = new TypeCounter();

  constructor(members: Map<number, Member>) {
    const elmtCount: ElementCount = new TypeCounter();
    let moonsignLv = 0;
    let witchRiteLv = 0;

    for (const member of members.values()) {
      const { data } = member;

      elmtCount.add(data.vision);

      if (data.faction?.includes("moonsign")) {
        moonsignLv++;
      }

      if (member.enhanced) {
        if (data.enhanceType === "HEXEREI") {
          witchRiteLv++;
        }

        // More future enhance types
      }
    }

    this.elmtCount = elmtCount;
    this.moonsignLv = Math.min(moonsignLv, 2);
    this.witchRiteLv = Math.min(witchRiteLv, 2);

    // ===== Resonances =====

    const resonances: AutoRsnElmtType[] = [];

    elmtCount.forEach((elmt, count) => {
      if (isAutoRsnElmt(elmt) && count >= 2) {
        resonances.push(elmt);
      }
    });

    this.resonances = resonances;
  }
}
