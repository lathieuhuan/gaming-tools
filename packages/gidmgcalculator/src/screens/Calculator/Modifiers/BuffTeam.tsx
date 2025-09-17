import { selectMoonsignCtrl } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useCalcTeamData } from "../ContextProvider";
import { GenshinModifierView } from "@/components";

export function BuffTeam() {
  const teamData = useCalcTeamData();
  const moonsignCtrl = useSelector(selectMoonsignCtrl);

  return (
    <div>
      {teamData.moonsignLv === 2 && (
        <div className="space-y-3">
          <GenshinModifierView
            heading={`Moonsign Lv.2`}
            description={
              <span>
                For 20s after a non-Moonsign character casts an ES or EB, all party members' Lunar Reaction DMG is
                increased based on the caster's Elemental Type, up to 36%, cannot stack.
              </span>
            }
            inputConfigs={[
              {
                type: "SELECT",
                options: ["Pyro", "Hydro", "Electro", "Cryo"],
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
