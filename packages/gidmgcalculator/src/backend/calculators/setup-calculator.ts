import { CalcSetup, Target } from "@Src/types";
import { TrackerControl } from "../controls";

export class SetupCalculator {
  constructor(private setup: CalcSetup, private target: Target, private tracker?: TrackerControl) {
    
  }
}
