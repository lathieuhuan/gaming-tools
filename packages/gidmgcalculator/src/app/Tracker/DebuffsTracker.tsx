import { clsx } from "rond";

import type { CalcTarget } from "@/calculation-new/core/CalcTarget";

import { ATTACK_ELEMENTS } from "@/constants";
import { useTranslation } from "@/hooks";

import { Heading, RecordContainer, RecordItem, RecordList } from "./_components";

type DebuffsTrackerProps = {
  listClassName?: string;
  target: CalcTarget;
};

export function DebuffsTracker({ listClassName, target }: DebuffsTrackerProps) {
  const { t } = useTranslation();

  return (
    <div className="-mt-1 -mb-3 divide-y divide-dark-line">
      <div className={clsx("py-3 empty:hidden", listClassName)}>
        {(["def", ...ATTACK_ELEMENTS] as const).map((attElmt) => {
          const { value: reduction, records = [] } = target.getReduction(attElmt);

          return (
            records.length !== 0 && (
              <div key={attElmt} className="break-inside-avoid">
                <Heading extra={reduction + "%"}>
                  {t(attElmt, { ns: "resistance" }) + " reduction"}
                </Heading>

                <RecordList records={records} calcFn={(value) => value + "%"} />
              </div>
            )
          );
        })}
      </div>

      <div className="pt-3">
        <p className="text-lg text-heading">Resistance Multipliers</p>
        <div className={listClassName}>
          {ATTACK_ELEMENTS.map((attElmt) => {
            const resistance = target.resistances[attElmt];
            const reduction = target.getReduction(attElmt).value;
            const reducedResistance = resistance - reduction;
            const label = `RES ${resistance}% - Reduction ${reduction}% = ${reducedResistance}% or`;

            return (
              <div key={attElmt} className="pl-2 break-inside-avoid">
                <Heading extra={target.resistMults[attElmt]}>
                  <span className="capitalize">{attElmt}</span>
                </Heading>

                <RecordContainer>
                  <RecordItem label={label} value={reducedResistance / 100} />
                  <RecordItem label="Equation" value={target.getResistMultEquation(attElmt)} />
                </RecordContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
