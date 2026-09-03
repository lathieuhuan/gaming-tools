import { round } from "ron-utils";
import { StatsTable, useScreenWatcher } from "rond";

import type { AttackBonusControl } from "@/models/Character";
import type { AllAttributes } from "@/types";

import { CORE_STAT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";

// Component
import { PositiveText } from "@/components/Text";
import { DamageBonusView } from "./DamageBonusView";
import { EmSection } from "./EmSection";

const { Row, Cell } = StatsTable;

type AttributeTableProps = {
  className?: string;
  attributes: AllAttributes;
  attkBonusCtrl?: AttackBonusControl;
};

export function AttributeTable({ className, attributes, attkBonusCtrl }: AttributeTableProps) {
  const { t } = useTranslation();
  const isMobile = !useScreenWatcher().isFromSize("md");

  if (!attributes) {
    return null;
  }

  return (
    <StatsTable className={className} aria-label="Attribute Table">
      {CORE_STAT_TYPES.map((type) => {
        const label = t(type);
        const base = round(attributes.get(`base_${type}`));
        const total = round(attributes.get(type));

        return (
          <Row key={type} aria-label={label} className="group" tabIndex={isMobile ? 0 : undefined}>
            <Cell>{label}</Cell>
            <Cell className="relative mr-2">
              <p className="group-hover:hidden group-focus-within:hidden">{total}</p>

              <p
                className={
                  "hidden whitespace-nowrap absolute top-0 right-0 " +
                  "group-hover:block group-focus-within:block"
                }
              >
                {base} + <PositiveText>{total - base}</PositiveText>
              </p>
            </Cell>
          </Row>
        );
      })}

      <EmSection value={attributes.get("em")} />

      {(["cRate_", "cDmg_", "er_", "healB_", "inHealB_", "shieldS_"] as const).map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{round(attributes.get(type), 1)}%</Cell>
          </Row>
        );
      })}

      <DamageBonusView attributes={attributes} attkBonusCtrl={attkBonusCtrl} />

      {(["naAtkSpd_", "caAtkSpd_"] as const).map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{round(attributes.get(type), 1)}%</Cell>
          </Row>
        );
      })}
    </StatsTable>
  );
}
