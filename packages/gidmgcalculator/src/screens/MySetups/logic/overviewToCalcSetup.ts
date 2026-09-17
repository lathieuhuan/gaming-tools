import type { ArtifactBuffCtrl, ArtifactDebuffCtrl } from "@/types";
import type { SetupOverviewInfo } from "../types";

import { CalcSetup } from "@/logic/calculator";
import { createTarget } from "@/logic/entity.logic";
import { enhanceCtrls } from "@/logic/modifier.logic";
import { getTeamBuffs } from "@/services/app-data";

export function overviewToCalcSetup(info: SetupOverviewInfo) {
  const { setup, dbSetup } = info;
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
    const setData = atfGear.sets.find((set) => set.data.code === ctrl.code)?.data;
    const data = setData?.debuffs?.find((debuff) => debuff.id === ctrl.id);

    if (setData && data) {
      artDebuffCtrls.push({ ...ctrl, data, setData });
    }
  }

  const calcSetup = CalcSetup.create(dbSetup.ID, setup.main, {
    selfBuffCtrls: enhanceCtrls(dbSetup.selfBuffCtrls, data.buffs),
    selfDebuffCtrls: enhanceCtrls(dbSetup.selfDebuffCtrls, data.debuffs),
    wpBuffCtrls: enhanceCtrls(dbSetup.wpBuffCtrls, weapon.data.buffs),
    artBuffCtrls,
    artDebuffCtrls,
    teamBuffCtrls: enhanceCtrls(dbSetup.teamBuffCtrls, getTeamBuffs()),
    teammates: setup.teammates,
    rsnBuffCtrls: dbSetup.rsnBuffCtrls,
    rsnDebuffCtrls: dbSetup.rsnDebuffCtrls,
    elmtEvent: dbSetup.elmtEvent,
    customBuffCtrls: dbSetup.customBuffCtrls,
    customDebuffCtrls: dbSetup.customDebuffCtrls,
    target: createTarget(dbSetup.target),
  });

  return calcSetup.calculate();
}
