import { selectProcessor, selectSimulation, useSimulatorStore } from "../../store";

import { EventListLayout } from "../EventListLayout";
import { AbilityEventList } from "./AbilityEventList";
import { ArtifactEventList } from "./ArtifactEventList";
import { WeaponEventList } from "./WeaponEventList";

export function ModifyEventMenu() {
  const activeMember = useSimulatorStore((state) => selectSimulation(state).activeMember);
  const team = useSimulatorStore((state) => selectProcessor(state).team);
  const memberOps = team.getMemberOps(team.getMember(activeMember));

  return (
    <div className="space-y-4">
      <EventListLayout title={"Character"}>
        <AbilityEventList memberOps={memberOps} />
      </EventListLayout>

      <EventListLayout title={"Weapon"}>
        <WeaponEventList memberOps={memberOps} />
      </EventListLayout>

      <EventListLayout title={"Artifact"}>
        <ArtifactEventList memberOps={memberOps} />
      </EventListLayout>
    </div>
  );
}
