import { useSimulatorStore } from "../store";

export function TopBar() {
  const team = useSimulatorStore((state) => state.team);

  console.log("team", team);

  const { resonances, moonsignLv, witchRiteLv } = team;

  return (
    <div className="flex justify-center bg-dark-2">
      <div className="w-full p-4 flex items-center gap-2">
        <p className="text-lg font-bold">Simulation Name</p>

        <div className="flex gap-2">
          {resonances.length > 0 && <div>Resonances: {team.resonances.join(", ")}</div>}
          {moonsignLv > 0 && <div>Moonsign LV: {moonsignLv}</div>}
          {witchRiteLv > 0 && <div>Witch Rite LV: {witchRiteLv}</div>}
        </div>
      </div>
    </div>
  );
}
