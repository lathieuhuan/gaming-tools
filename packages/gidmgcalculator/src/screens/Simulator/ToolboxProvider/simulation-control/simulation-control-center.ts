import type { SimulationMember, SimulationTarget } from "@Src/types";
import type { SimulationProcessedChunk, SimulationSumary } from "../ToolboxProvider.types";
import { SimulationControlStarter } from "./simulation-control-starter";
import { ActiveMemberWatcher } from "./active-member-watcher";
import { ConfigTalentHitEventArgs, TalentEventConfig } from "./member-control";

export class SimulationControlCenter extends SimulationControlStarter {
  protected chunks: SimulationProcessedChunk[] = [];
  protected sumary: SimulationSumary = {
    damage: 0,
    duration: 0,
  };
  protected chunksSubscribers = new Set<OnChangeChunks>();

  protected get latestChunk() {
    return this.chunks[this.chunks.length - 1];
  }

  private activeMemberCode: number;
  private activeMemberWatcher: ActiveMemberWatcher;

  protected get activeMember() {
    return this.member[this.activeMemberCode];
  }

  constructor(party: SimulationMember[], target: SimulationTarget) {
    super(party, target);

    this.activeMemberCode = this.partyData[0].code;
    this.activeMemberWatcher = new ActiveMemberWatcher(this.activeMember);
  }

  genManager = () => {
    const getMemberInfo = (code: number) => {
      return this.member[code].info;
    };

    const getMemberData = (code: number) => {
      return this.member[code].data;
    };

    return {
      partyData: this.partyData,
      target: this.target,
      getMemberInfo,
      getMemberData,
      getAppWeaponOfMember: this.getAppWeaponOfMember,
      subscribeChunks: this.subscribeChunks,
      subscribeTotalAttr: this.activeMemberWatcher.subscribeTotalAttr,
      subscribeBonuses: this.activeMemberWatcher.subscribeBonuses,
    };
  };

  genActiveMember = (memberCode: number) => {
    this.changeActiveMember(memberCode);

    const configTalentHitEvent = (args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">): TalentEventConfig => {
      return this.activeMember?.configTalentHitEvent({
        ...args,
        partyData: this.partyData,
        target: this.target,
      });
    };

    return {
      info: this.activeMember.info,
      data: this.activeMember.data,
      tools: {
        configTalentHitEvent,
      },
    };
  };

  private changeActiveMember = (code: number) => {
    this.activeMemberCode = code;
    this.activeMemberWatcher.changeActiveMember(this.activeMember);
  }

  private subscribeChunks = (callback: OnChangeChunks) => {
    this.chunksSubscribers.add(callback);

    const unsubscribe = () => {
      this.chunksSubscribers.delete(callback);
    };

    return {
      initialChunks: this.chunks,
      initialSumary: this.sumary,
      unsubscribe,
    };
  }

  protected notifyActiveMemberSubscribers = () => {
    this.activeMemberWatcher.notifySubscribers();
  }

  protected notifyChunksSubscribers = () => {
    // console.log("notifyChunksSubscribers");
    // console.log(this.chunks);
    // console.log(receivers);

    this.chunksSubscribers.forEach((callback) => callback(this.chunks.concat(), this.sumary));
  }
}

type OnChangeChunks = (chunks: SimulationProcessedChunk[], sumary: SimulationSumary) => void;
