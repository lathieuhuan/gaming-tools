import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { clsx, round, StatsTable, CollapseSpace, type PartiallyRequired } from "rond";
import { ATTACK_ELEMENTS, CORE_STAT_TYPES, GeneralCalc, CoreStat, TotalAttribute } from "@Calculation";

import { useTranslation } from "@/hooks";

// Component
import { markGreen } from "@/components";

const { Row, Cell } = StatsTable;

interface EmSectionProps {
  em: number;
}
const EmSection = ({ em }: EmSectionProps) => {
  const [dropped, setDropped] = useState(false);
  const rxnBonusFromEM = GeneralCalc.getRxnBonusesFromEM(em);

  return (
    <div>
      <Row className="!hidden" />
      <Row className="cursor-pointer" onClick={() => setDropped(!dropped)} aria-label="Elemental Mastery">
        <Cell className="flex items-center">
          <p className="mr-1">Elemental Mastery</p>
          <FaCaretDown
            className={clsx("duration-150 ease-linear", dropped ? "text-active-color" : "text-light-default rotate-90")}
          />
        </Cell>
        <Cell className="mr-2">{round(em, 1)}</Cell>
      </Row>
      <CollapseSpace active={dropped}>
        <ul className="px-2 py-1 text-sm flex flex-col space-y-1">
          <li>Increases damage dealt by Vaporize and Melt by {markGreen(rxnBonusFromEM.amplifying)}%.</li>
          <li>
            Increases damage dealt by Overloaded, Superconduct, Electro-Charged, Burning, Shattered, Swirl, Bloom,
            Hyperbloom, and Burgeon by {markGreen(rxnBonusFromEM.transformative)}%.
          </li>
          <li>Increases the DMG Bonus provided by Aggravate and Spread by {markGreen(rxnBonusFromEM.quicken)}%.</li>
          <li>
            Increases the damage absorption power of shields created through Crystallize by{" "}
            {markGreen(rxnBonusFromEM.shield)}%.
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
  if (!attributes) return null;

  return (
    <StatsTable aria-label="attribute-table">
      {CORE_STAT_TYPES.map((type) => {
        const total = Math.round(attributes[type]);
        const base = attributes[`${type}_base`];
        const bonus = base === undefined ? undefined : total - Math.round(base);
        const label = t(type);

        return (
          <Row key={type} className="group" aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="relative">
              <p className={clsx("mr-2", bonus !== undefined && "group-hover:hidden")}>{total}</p>
              {bonus !== undefined ? (
                <p className="mr-2 hidden whitespace-nowrap group-hover:block group-hover:absolute group-hover:top-0 group-hover:right-0">
                  {total - bonus} + {markGreen(bonus)}
                </p>
              ) : null}
            </Cell>
          </Row>
        );
      })}

      <EmSection em={attributes?.em || 0} />

      {(["cRate_", "cDmg_", "er_", "healB_", "inHealB_", "shieldS_"] as const).map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {ATTACK_ELEMENTS.map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {(["naAtkSpd_", "caAtkSpd_"] as const).map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round((attributes?.[type] || 0) * 10) / 10}%</Cell>
          </Row>
        );
      })}
    </StatsTable>
  );
}
