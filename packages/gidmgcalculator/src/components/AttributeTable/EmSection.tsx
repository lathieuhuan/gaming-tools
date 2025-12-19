import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { clsx, CollapseSpace, round, StatsTable } from "rond";

import { getRxnBonusesFromEM } from "@/calculation/core/getRxnBonusesFromEM";
import { markGreen } from "@/components";

const { Row, Cell } = StatsTable;

type EmSectionProps = {
  value?: number;
};

export function EmSection({ value = 0 }: EmSectionProps) {
  const [dropped, setDropped] = useState(false);
  const rxnBonusesFromEM = getRxnBonusesFromEM(value);

  return (
    <div>
      <Row className="!hidden" />
      <Row
        className="cursor-pointer"
        onClick={() => setDropped(!dropped)}
        aria-label="Elemental Mastery"
      >
        <Cell className="flex items-center">
          <p className="mr-1">Elemental Mastery</p>
          <FaCaretDown
            className={clsx(
              "duration-150 ease-linear",
              dropped ? "text-active" : "text-light-1 rotate-90"
            )}
          />
        </Cell>
        <Cell className="mr-2">{round(value, 1)}</Cell>
      </Row>
      <CollapseSpace active={dropped}>
        <ul className="px-2 py-1 text-sm flex flex-col space-y-1">
          <li>
            Increases damage dealt by Vaporize and Melt by {markGreen(rxnBonusesFromEM.amplifying)}
            %.
          </li>
          <li>
            Increases damage dealt by Overloaded, Superconduct, Electro-Charged, Burning, Shattered,
            Swirl, Bloom, Hyperbloom, and Burgeon by {markGreen(rxnBonusesFromEM.transformative)}%.
          </li>
          <li>
            Increases the DMG Bonus provided by Aggravate and Spread by{" "}
            {markGreen(rxnBonusesFromEM.quicken)}%.
          </li>
          <li>
            Increases the damage absorption power of shields created through Crystallize by{" "}
            {markGreen(rxnBonusesFromEM.shield)}%.
          </li>
        </ul>
      </CollapseSpace>
    </div>
  );
}
