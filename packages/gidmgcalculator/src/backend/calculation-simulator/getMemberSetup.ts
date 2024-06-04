import getCalcItemPart from "./getCalcItemPart";
import getMemberStats, { type GetMemberStatsArgs } from "./getMemberStats";
import getResistances, { type GetResistancesArgs } from "./getResistances";

type GetMemberSetupArgs = GetMemberStatsArgs &
  GetResistancesArgs & {
    //
  };
export function getMemberSetup({
  char,
  appChar,
  weapon,
  appWeapon,
  artifacts,
  attributeBonus,
  target,
}: GetMemberSetupArgs) {
  const { totalAttr } = getMemberStats({
    char,
    appChar,
    weapon,
    appWeapon,
    artifacts,
    attributeBonus,
  });

  const resistances = getResistances({ target });

  const calcItemPart = getCalcItemPart();

  return {
    totalAttr,
    calcItemPart,
  };
}
