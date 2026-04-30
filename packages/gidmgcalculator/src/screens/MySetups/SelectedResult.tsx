import { useMemo } from "react";

import type { ArtifactBuffCtrl, ArtifactDebuffCtrl, DbSetup } from "@/types";
import type { SetupOverviewInfo } from "./types";

import { calculateSetup } from "@/calculation/calculator";
import { enhanceCtrls } from "@/logic/modifier.logic";
import { CalcSetup, Target, Team } from "@/models";
import { $AppArtifact, $AppData } from "@/services";

import { FinalResultView } from "@/components";
import { SetupModals } from "./SetupModals";

type SelectedResultProps = {
  setup: SetupOverviewInfo["setup"];
  dbSetup: DbSetup;
};

export function SelectedResult({ setup, dbSetup }: SelectedResultProps) {
  //
  const { calcSetup, result } = useMemo(() => {
    const { teammates } = setup;
    const { data, weapon, atfGear } = setup.main;

    const artBuffCtrls: ArtifactBuffCtrl[] = [];

    for (const ctrl of dbSetup.artBuffCtrls) {
      const setData = atfGear.sets.find((set) => set.data.code === ctrl.code)?.data;
      const data = setData?.buffs?.find((buff) => buff.id === ctrl.id);

      if (setData && data) {
        artBuffCtrls.push({ ...ctrl, data, setData });
      }
    }

    const artDebuffCtrls: ArtifactDebuffCtrl[] = [];

    for (const ctrl of dbSetup.artDebuffCtrls) {
      const setData = $AppArtifact.getSet(ctrl.code)!;
      const data = setData?.debuffs?.find((debuff) => debuff.id === ctrl.id);

      if (setData && data) {
        artDebuffCtrls.push({ ...ctrl, data, setData });
      }
    }

    const team = new Team([setup.main, ...teammates]);

    const calcSetup = new CalcSetup({
      ID: dbSetup.ID,
      main: setup.main,
      selfBuffCtrls: enhanceCtrls(dbSetup.selfBuffCtrls, data.buffs),
      selfDebuffCtrls: enhanceCtrls(dbSetup.selfDebuffCtrls, data.debuffs),
      wpBuffCtrls: enhanceCtrls(dbSetup.wpBuffCtrls, weapon.data.buffs),
      artBuffCtrls,
      artDebuffCtrls,
      teamBuffCtrls: enhanceCtrls(dbSetup.teamBuffCtrls, $AppData.teamBuffs),
      teammates: setup.teammates,
      team,
      rsnBuffCtrls: dbSetup.rsnBuffCtrls,
      rsnDebuffCtrls: dbSetup.rsnDebuffCtrls,
      elmtEvent: dbSetup.elmtEvent,
      customBuffCtrls: dbSetup.customBuffCtrls,
      customDebuffCtrls: dbSetup.customDebuffCtrls,
      target: new Target(dbSetup.target, $AppData.getMonster(dbSetup.target)!),
    });

    const { main, result, target: calcTarget } = calculateSetup(calcSetup);

    calcSetup.main = main;
    calcSetup.target = calcTarget;

    return {
      calcSetup,
      result,
    };
  }, [setup]);

  return (
    <div className="h-full flex flex-col">
      <div>
        <p className="text-sm text-center truncate">{setup.name}</p>
      </div>
      <div className="mt-2 grow hide-scrollbar">
        <FinalResultView character={calcSetup.main} finalResult={result} />
      </div>

      <SetupModals setupName={setup.name} setup={calcSetup} />
    </div>
  );
}
