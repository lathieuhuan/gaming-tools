import { EventListLayout } from "../EventListLayout";
import { AbilityEventList } from "./AbilityEventList";

export function ModifyEventMenu() {
  return (
    <div className="space-y-4">
      <EventListLayout title={"Character"}>
        <AbilityEventList />
      </EventListLayout>
    </div>
  );
}
