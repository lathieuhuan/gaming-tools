import { useEffect, useId, useState } from "react";
import { clsx } from "rond";

import type { CoreStat, TotalAttributes } from "@/types";

import { CORE_STAT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";

// Component
import { markGreen } from "@/components";
import { CoreStatRow } from "./CoreStatRow";

export type CoreStatRowsProps = {
  attributes: TotalAttributes;
};

export function CoreStatRows({ attributes }: CoreStatRowsProps) {
  const { t } = useTranslation();

  return (
    <>
      {CORE_STAT_TYPES.map((type) => {
        const label = t(type);
        const base = attributes.get(`base_${type}`);

        return (
          <CoreStatRow
            key={type}
            className="group"
            label={label}
            total={attributes.get(type)}
            base={base}
            renderValue={(total, bonus = 0) => {
              return (
                <span>
                  <p className={clsx("mr-2", bonus !== undefined && "group-hover:hidden")}>
                    {total}
                  </p>

                  {bonus !== undefined ? (
                    <p className="mr-2 hidden whitespace-nowrap group-hover:block group-hover:absolute group-hover:top-0 group-hover:right-0">
                      {total - bonus} + {markGreen(bonus)}
                    </p>
                  ) : null}
                </span>
              );
            }}
          />
        );
      })}
    </>
  );
}

export function CoreStatRowsMobile({ attributes }: CoreStatRowsProps) {
  const { t } = useTranslation();
  const id = useId();
  const [selectedStat, setSelectedStat] = useState<CoreStat | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(`[data-id="${id}"]`)) {
        setSelectedStat(null);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      {CORE_STAT_TYPES.map((type) => {
        const label = t(type);
        const base = attributes.get(`base_${type}`);

        return (
          <CoreStatRow
            key={type}
            data-id={id}
            label={label}
            total={attributes.get(type)}
            base={base}
            onClick={() => {
              if (base !== undefined) {
                setSelectedStat(type);
              }
            }}
            renderValue={(total, bonus = 0) => {
              return (
                <span>
                  {selectedStat === type ? (
                    <p className="mr-2 whitespace-nowrap">
                      {total - bonus} + {markGreen(bonus)}
                    </p>
                  ) : (
                    <p className="mr-2">{total}</p>
                  )}
                </span>
              );
            }}
          />
        );
      })}
    </>
  );
}
