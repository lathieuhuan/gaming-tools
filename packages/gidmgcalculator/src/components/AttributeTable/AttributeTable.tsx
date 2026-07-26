import { clsx, StatsTable, useScreenWatcher } from "rond";

import { ATTACK_ELEMENTS, CORE_STAT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import type { AllAttributes } from "@/types";

// Component
import { PositiveText } from "@/components/Text";
import { EmSection } from "./EmSection";

const { Row, Cell } = StatsTable;

interface AttributeTableProps {
  className?: string;
  attributes: AllAttributes;
}

export function AttributeTable({ className, attributes }: AttributeTableProps) {
  const { t } = useTranslation();
  const isMobile = !useScreenWatcher().isFromSize("md");

  if (!attributes) {
    return null;
  }

  return (
    <StatsTable className={className} aria-label="Attribute Table">
      {CORE_STAT_TYPES.map((type) => {
        const label = t(type);
        const base = attributes.get(`base_${type}`);
        const total = Math.round(attributes.get(type));
        const bonus = base === undefined ? undefined : total - Math.round(base);

        return (
          <Row key={type} aria-label={label} className="group" tabIndex={isMobile ? 0 : undefined}>
            <Cell>{label}</Cell>
            <Cell className="relative mr-2">
              <p
                className={clsx(
                  bonus !== undefined && "group-hover:hidden group-focus-within:hidden",
                )}
              >
                {total}
              </p>

              {bonus !== undefined && (
                <p
                  className={
                    "hidden whitespace-nowrap absolute top-0 right-0 " +
                    "group-hover:block group-focus-within:block"
                  }
                >
                  {total - bonus} + <PositiveText>{bonus}</PositiveText>
                </p>
              )}
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
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {ATTACK_ELEMENTS.map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}

      {(["naAtkSpd_", "caAtkSpd_"] as const).map((type) => {
        const label = t(type);
        return (
          <Row key={type} aria-label={label}>
            <Cell>{label}</Cell>
            <Cell className="mr-2">{Math.round(attributes.get(type) * 10) / 10}%</Cell>
          </Row>
        );
      })}
    </StatsTable>
  );
}
