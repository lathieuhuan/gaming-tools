import type { DeepReadonly } from "rond";
import type { AppCharactersByName } from "@Src/types";
import type { AppCharacter, ElementCount, TalentType } from "@Src/calculation/types";

import TypeCounter from "@Src/utils/type-counter";
import { isValidTeamElmt } from "../condition-checking";

export class TeamData {
  protected _activeMemberN: string;
  protected _teammateNs: string[];
  protected _elmtCount: ElementCount = new TypeCounter();
  protected _moonsignLv = 0;
  protected extraTalentLv = new TypeCounter<TalentType>();

  get activeAppMember() {
    return this.getAppMember(this._activeMemberN);
  }

  get appTeammates() {
    return this._teammateNs.map((teammateN) => this.getAppMember(teammateN));
  }

  /** Count of the whole team */
  get elmtCount() {
    return this._elmtCount;
  }

  /** Count of the team except the active member */
  get teammateElmtCount() {
    const newCounter = new TypeCounter(this._elmtCount.result);
    newCounter.add(this.activeAppMember.vision, -1);
    return newCounter;
  }

  get moonsignLv() {
    return this._moonsignLv;
  }

  constructor(activeMemberN: string, teammateNs: string[], public data: AppCharactersByName) {
    this._activeMemberN = activeMemberN;
    this._teammateNs = teammateNs;
    this.countElements();
    this.countExtraTalentLv();
    this.countMoonsignLv();
  }

  getAppMember(memberName: string) {
    const data = this.data[memberName];

    if (!data) {
      console.error(`Data not found for character ${memberName}`);
    }
    return data;
  }

  protected hasMember = (memberN: string) => {
    return this._teammateNs.includes(memberN) || memberN === this._activeMemberN;
  };

  protected countElements = () => {
    this._elmtCount.clear();
    this._teammateNs.forEach((teammateN) => this._elmtCount.add(this.getAppMember(teammateN).vision));
    this._elmtCount.add(this.activeAppMember.vision);
  };

  protected countMoonsignLv = () => {
    let moonsignLv = this.activeAppMember.faction?.includes("moonsign") ? 1 : 0;

    for (const teammate of this.appTeammates) {
      if (teammate.faction?.includes("moonsign")) {
        moonsignLv++;
      }
    }

    this._moonsignLv = Math.min(moonsignLv, 2);
  };

  protected countExtraTalentLv = () => {
    this.extraTalentLv.clear();
    const { extraTalentLv } = this;

    if (this.hasMember("Tartaglia")) {
      extraTalentLv.add("NAs");
    }
    if (this.hasMember("Skirk")) {
      const isValid = isValidTeamElmt(this._elmtCount, {
        teamOnlyElmts: ["hydro", "cryo"],
        teamEachElmtCount: {
          hydro: 1,
          cryo: 1,
        },
      });

      if (isValid) {
        extraTalentLv.add("ES");
      }
    }
  };

  forEachAppTeammate = (callback: (data: DeepReadonly<AppCharacter>) => void) => {
    for (const teammateN of this._teammateNs) {
      callback(this.getAppMember(teammateN));
    }
  };
}
