import { selectProcessor, selectSimulation, useSimulatorStore } from "../../store";

import { EventListLayout } from "../EventListLayout";
import { AbilityBuffList } from "./AbilityBuffList";
import { ArtifactBuffList } from "./ArtifactBuffList";
import { WeaponBuffList } from "./WeaponBuffList";

export function BuffEventMenu() {
  const activeMember = useSimulatorStore((state) => selectSimulation(state).activeMember);
  const team = useSimulatorStore((state) => selectProcessor(state).team);
  const memberOps = team.getMemberOps(team.getMember(activeMember));

  return (
    <div className="space-y-4">
      <EventListLayout title={"Character"}>
        <AbilityBuffList memberOps={memberOps} />
      </EventListLayout>

      <EventListLayout title={"Weapon"}>
        <WeaponBuffList memberOps={memberOps} />
      </EventListLayout>

      <EventListLayout title={"Artifact"}>
        <ArtifactBuffList memberOps={memberOps} />
      </EventListLayout>
    </div>
  );
}
