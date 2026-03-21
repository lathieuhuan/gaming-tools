import { HitEvent, ModifyEvent, Simulation, SimulationEvent, SimulationSummary } from "../types";

export class SimulationProcessor {
  onFieldMember: number;
  summary: SimulationSummary = {
    totalDamage: 0,
  };

  constructor({ members, timeline }: Simulation) {
    this.onFieldMember = members[0].code;
  }

  processHitEvent(event: HitEvent) {
    switch (event.subType) {
      case "Th": {
        //
        break;
      }
      case "Rh": {
        // TODO
        break;
      }
      default:
        event satisfies never;
    }
  }

  processModifyEvent(event: ModifyEvent) {
    // TODO
  }

  processEvent(event: SimulationEvent) {
    switch (event.type) {
      case "SI":
        this.onFieldMember = event.performer;
        break;
      case "M":
        this.processModifyEvent(event);
        break;
      case "H":
        this.processHitEvent(event);
        break;
      default:
        event satisfies never;
    }
  }
}
