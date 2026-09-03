import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { round } from "ron-utils";
import { clsx, CollapseSpace, StatsTable } from "rond";

import { getRxnBonusesFromEM } from "@/calculation/core/getRxnBonusesFromEM";
import { PositiveText } from "@/components/Text";

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
        aria-label="Elemental Mastery"
        onClick={() => setDropped(!dropped)}
      >
        <Cell className="flex items-center">
          <p className="mr-1">Elemental Mastery</p>
          <FaCaretDown
            className={clsx(
              "duration-150 ease-linear",
              dropped ? "text-active" : "text-light-1 rotate-90",
            )}
          />
        </Cell>
        <Cell className="mr-2">{round(value, 1)}</Cell>
      </Row>
      <CollapseSpace active={dropped}>
        <ul className="px-2 py-1 text-sm flex flex-col space-y-1">
          <li>
            • Vaporize, Melt DMG +<PositiveText>{rxnBonusesFromEM.amplifying}%</PositiveText>.
          </li>
          <li>
            • Overloaded, Superconduct, Electro-Charged, Burning, Shattered, Swirl, Bloom,
            Hyperbloom, Burgeon DMG +<PositiveText>{rxnBonusesFromEM.transformative}%</PositiveText>
            .
          </li>
          <li>
            • Aggravate, Spread DMG +<PositiveText>{rxnBonusesFromEM.quicken}%</PositiveText>.
          </li>
          <li>
            • Lunar-Charged, Solar-Bloom, Lunar-Crystallize, Stellar-Conduct, Stellar-Swirl DMG +
            <PositiveText>{rxnBonusesFromEM.lunar}%</PositiveText>.
          </li>
          <li>
            • Crystallize shield DMG absorption +
            <PositiveText>{rxnBonusesFromEM.shield}%</PositiveText>
          </li>
        </ul>
      </CollapseSpace>
    </div>
  );
}
