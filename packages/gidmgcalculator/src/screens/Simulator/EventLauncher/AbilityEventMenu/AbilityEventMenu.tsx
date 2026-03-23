import { useState } from "react";

import { NORMAL_ATTACKS } from "@/constants";
import { useTranslation } from "@/hooks";
import { selectActiveMember, selectSimulation, useSimulatorStore } from "../../store";

// Components
import { EventListLayout } from "../EventListLayout";
import { AbilityEventList } from "./AbilityEventList";

export function AbilityEventMenu() {
  const { t } = useTranslation();
  const activeMember = useSimulatorStore(selectActiveMember);
  const target = useSimulatorStore((state) => selectSimulation(state).target);

  const [activeNames, setActiveNames] = useState<string[]>([]);

  const handleClickHeading = (name: string) => {
    setActiveNames(activeNames.includes(name) ? [] : [name]);

    // setActiveNames(
    //   activeNames.includes(name) ? activeNames.filter((n) => n !== name) : [...activeNames, name]
    // );
  };

  return (
    <div className="space-y-4">
      <EventListLayout title={t("NAs")}>
        {NORMAL_ATTACKS.map((type) => {
          return (
            <AbilityEventList
              key={type}
              className="space-y-2"
              character={activeMember}
              target={target}
              attPatt={type}
              activeNames={activeNames}
              onClickHeading={handleClickHeading}
            />
          );
        })}
      </EventListLayout>

      {/* <EventListLayout title={t("ES")}>
        <AbilityEventList
          className="space-y-2"
          character={activeMember}
          attPatt="ES"
          activeNames={activeNames}
          onClickHeading={handleClickHeading}
        />
      </EventListLayout> */}

      {/* <EventListLayout title={t("EB")}>
        <AbilityEventList
          className="space-y-2"
          character={activeMember}
          attPatt="EB"
          activeNames={activeNames}
          onClickHeading={handleClickHeading}
        />
      </EventListLayout> */}
    </div>
  );
}
