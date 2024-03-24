import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { clsx, round, StatsTable, CollapseSpace, type PartiallyRequired } from "rond";

import type { CoreStat, TotalAttribute } from "@Src/types";
import { ATTACK_ELEMENTS, CORE_STAT_TYPES } from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { Calculation_ } from "@Src/utils";

// Component
import { Green } from "@Src/components";

interface EmSectionProps {
  em: number;
}
const EmSection = ({ em }: EmSectionProps) => {
  const [dropped, setDropped] = useState(false);
  const rxnBonusFromEM = Calculation_.getRxnBonusesFromEM(em);

  return (
    <div>
      <StatsTable.Row className="!hidden">{}</StatsTable.Row>
      <StatsTable.Row className="cursor-pointer" onClick={() => setDropped(!dropped)}>
        <div className="flex items-center">
          <p className="mr-1">Elemental Mastery</p>
          <FaCaretDown
            className={clsx("duration-150 ease-linear", dropped ? "text-active-color" : "text-light-default rotate-90")}
          />
        </div>
        <p className="mr-2">{round(em, 1)}</p>
      </StatsTable.Row>
      <CollapseSpace active={dropped}>
        <ul className="px-2 py-1 text-sm flex flex-col space-y-1">
          <li>
            Increases damage dealt by Vaporize and Melt by <Green>{rxnBonusFromEM.amplifying}%</Green>.
          </li>
          <li>
            Increases damage dealt by Overloaded, Superconduct, Electro-Charged, Burning, Shattered, Swirl, Bloom,
            Hyperbloom, and Burgeon by <Green>{rxnBonusFromEM.transformative}%</Green>.
          </li>
          <li>
            Increases the DMG Bonus provided by Aggravate and Spread by <Green>{rxnBonusFromEM.quicken}%</Green>.
          </li>
          <li>
            Increases the damage absorption power of shields created through Crystallize by{" "}
            <Green>{rxnBonusFromEM.shield}%</Green>.
          </li>
        </ul>
      </CollapseSpace>
    </div>
  );
};

interface AttributeTableProps {
  attributes: PartiallyRequired<Partial<TotalAttribute>, CoreStat>;
}
export function AttributeTable({ attributes }: AttributeTableProps) {
  const { t } = useTranslation();

  if (!attributes) {
    return null;
  }

  return (
    <StatsTable>
      {CORE_STAT_TYPES.map((type) => {
        const baseAttr = attributes?.[`base_${type}`] || 0;
        const totalAttr = attributes?.[type] || 0;

        return (
          <StatsTable.Row key={type} className="group">
            <p>{t(type)}</p>
            <div className="relative">
              <p className={clsx("mr-2", { "group-hover:hidden": baseAttr })}>{Math.round(totalAttr)}</p>
              {baseAttr ? (
                <p className="mr-2 hidden whitespace-nowrap group-hover:block group-hover:absolute group-hover:top-0 group-hover:right-0">
                  {baseAttr} + <Green>{Math.round(totalAttr - baseAttr)}</Green>
                </p>
              ) : null}
            </div>
          </StatsTable.Row>
        );
      })}

      <EmSection em={attributes?.em || 0} />

      {(["cRate_", "cDmg_", "er_", "healB_", "inHealB_", "shieldS_"] as const).map((type) => {
        return (
          <StatsTable.Row key={type}>
            <p>{t(type)}</p>
            <p className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</p>
          </StatsTable.Row>
        );
      })}

      {ATTACK_ELEMENTS.map((type) => {
        return (
          <StatsTable.Row key={type}>
            <p>{t(type)}</p>
            <p className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</p>
          </StatsTable.Row>
        );
      })}

      {(["naAtkSpd_", "caAtkSpd_"] as const).map((type) => {
        return (
          <StatsTable.Row key={type}>
            <p>{t(type)}</p>
            <p className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</p>
          </StatsTable.Row>
        );
      })}
    </StatsTable>
  );
}
