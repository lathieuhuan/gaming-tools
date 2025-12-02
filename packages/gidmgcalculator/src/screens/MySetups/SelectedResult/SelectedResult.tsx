import { useMemo } from "react";

import type { IDbSetup, ITarget } from "@/types";
import type { SetupOverviewInfo } from "../types";

import { calculateSetup } from "@/calculation-new/calculator";
import { Setup } from "@/models/base/Setup";
import { CalcTeam } from "@/models/calculator";
import { enhanceCtrls } from "@/models/userdb/utils/enhanceCtrls";
import { $AppData } from "@/services";

import { FinalResultView } from "@/components";
import { SetupModals } from "../SetupModals";

type SelectedResultProps = {
  setup: SetupOverviewInfo["setup"];
  dbSetup: IDbSetup;
};

export function SelectedResult({ setup, dbSetup }: SelectedResultProps) {
  const { calcSetup, result } = useMemo(() => {
    const { teammates } = setup;
    const { data, weapon, artifact } = setup.main;

    const target: ITarget = {
      ...dbSetup.target,
      data: $AppData.getMonster(dbSetup.target)!,
    };

    const team = new CalcTeam(setup.main, teammates);

    const calcSetup = new Setup({
      ID: dbSetup.ID,
      char: setup.main,
      selfBuffCtrls: enhanceCtrls(dbSetup.selfBuffCtrls, data.buffs),
      selfDebuffCtrls: enhanceCtrls(dbSetup.selfDebuffCtrls, data.debuffs),
      wpBuffCtrls: enhanceCtrls(dbSetup.wpBuffCtrls, weapon.data.buffs),
      artBuffCtrls: [],
      artDebuffCtrls: [],
      teamBuffCtrls: enhanceCtrls(dbSetup.teamBuffCtrls, $AppData.teamBuffs),
      teammates: setup.teammates,
      team,
      rsnBuffCtrls: [],
      rsnDebuffCtrls: [],
      elmtEvent: dbSetup.elmtEvent,
      customBuffCtrls: dbSetup.customBuffCtrls,
      customDebuffCtrls: dbSetup.customDebuffCtrls,
      target,
    });

    const { main, result, target: calcTarget } = calculateSetup(calcSetup);

    calcSetup.char = main;
    calcSetup.target = calcTarget;

    return { calcSetup, result };
  }, [setup]);

  return (
    <div className="h-full flex flex-col">
      <div>
        <p className="text-sm text-center truncate">{setup.name}</p>
      </div>
      <div className="mt-2 grow hide-scrollbar">
        <FinalResultView character={calcSetup.char} finalResult={result} />
      </div>

      <SetupModals
        setupName={setup.name}
        setup={calcSetup}
        artifactAttrs={calcSetup.char.totalAttrs}
        result={result}
      />
    </div>
  );
}
