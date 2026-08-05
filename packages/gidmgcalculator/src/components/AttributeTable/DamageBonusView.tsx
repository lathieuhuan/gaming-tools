import { useState } from "react";
import { round } from "ron-utils";
import { Match, StatsTable, Tabs } from "rond";

import type { AttackBonusControl } from "@/models/Character";
import type { AllAttributes, LunarType, StellarType } from "@/types";

import { getRxnBonusesFromEM } from "@/calculation/core/getRxnBonusesFromEM";
import { ATTACK_ELEMENTS, LUNAR_TYPES, STELLAR_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { getRxnBonusesFromEM } from "@/calculation/core/getRxnBonusesFromEM";

const { Row, Cell } = StatsTable;

const lunarStellarTypes: (LunarType | StellarType)[] = [...LUNAR_TYPES, ...STELLAR_TYPES];

type DamageBonusType = "elemental" | "lunar-stellar";

type DamageBonusViewProps = {
  attributes: AllAttributes;
  attkBonusCtrl?: AttackBonusControl;
};

export function DamageBonusView({ attributes, attkBonusCtrl }: DamageBonusViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DamageBonusType>("elemental");

  const elementalRows = ATTACK_ELEMENTS.map((type) => {
    const label = t(`${type}_attElmt`) + " DMG Bonus";
    return (
      <Row key={type} aria-label={label}>
        <Cell>{label}</Cell>
        <Cell className="mr-2">{round(attributes.get(type), 1)}%</Cell>
      </Row>
    );
  });

  if (!attkBonusCtrl) {
    return elementalRows;
  }

  const bonusFromEm = getRxnBonusesFromEM(attributes.get("em")).lunar;

  return (
    <div className="pt-2">
      <Tabs<DamageBonusType>
        variant="secondary"
        size="sm"
        prefix={<span className="text-light-hint">DMG Bonus:</span>}
        items={[
          {
            label: "Elemental",
            value: "elemental",
          },
          {
            label: "Lunar / Stellar",
            value: "lunar-stellar",
          },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <Match
        value={activeTab}
        cases={[
          {
            value: "elemental",
            render: <div>{elementalRows}</div>,
          },
          {
            value: "lunar-stellar",
            render: (
              <div className="min-h-64">
                {lunarStellarTypes.map((type) => {
                  const label = t(type) + " DMG Bonus";
                  const value = attkBonusCtrl.get("pct_", [type]) - bonusFromEm;

                  return (
                    <Row key={type} aria-label={label}>
                      <Cell>{label}</Cell>
                      <Cell className="mr-2">{round(value, 1)}%</Cell>
                    </Row>
                  );
                })}
              </div>
            ),
          },
        ]}
      />

      <div className="h-px bg-dark-line" />
    </div>
  );
}
