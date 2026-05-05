import { EventListLayout } from "../EventListLayout";
import { TeamBuffList } from "./TeamBuffList";

export function TeamModifyEventMenu() {
  return (
    <div className="space-y-4">
      <EventListLayout title={"Buffs"}>
        <TeamBuffList />
      </EventListLayout>
    </div>
  );
}
