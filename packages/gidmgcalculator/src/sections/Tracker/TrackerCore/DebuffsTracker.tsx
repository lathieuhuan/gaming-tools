import { ATTACK_ELEMENTS, ResistReduction, TrackerResult } from "@Calculation";

import { useTranslation } from "@Src/hooks";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

function getResMult(type: "equation" | "value", value: number) {
  const RES = value / 100;

  if (type === "equation") {
    return `${RES < 0 ? `1 - (${RES} / 2)` : RES >= 0.75 ? `1 / (4 * ${RES} + 1)` : `1 - ${RES}`}`;
  }
  return RES < 0 ? 1 - RES / 2 : RES >= 0.75 ? 1 / (4 * RES + 1) : 1 - RES;
}

export function DebuffsTracker({ result }: { result?: TrackerResult }) {
  const { t } = useTranslation();
  const { RESIST } = result || {};
  const hasRecord = RESIST && Object.values(RESIST).some((record) => RESIST.length);
  const totalResistReduct = {} as ResistReduction;

  for (const attElmt of ["def", ...ATTACK_ELEMENTS] as const) {
    totalResistReduct[attElmt] = getTotalRecordValue(RESIST?.[attElmt] || []);
  }

  return (
    <div className="-mt-1 -mb-3 divide-y divide-surface-border">
      {hasRecord && (
        <div className={"py-3 " + recordListStyles}>
          {(["def", ...ATTACK_ELEMENTS] as const).map((attElmt) => {
            const records = RESIST?.[attElmt] || [];

            return records.length ? (
              <div key={attElmt} className="break-inside-avoid">
                {renderHeading(t(attElmt, { ns: "resistance" }) + " reduction", totalResistReduct[attElmt] + "%")}

                <ul className="pl-4 list-disc">{records.map(renderRecord((value) => value + "%"))}</ul>
              </div>
            ) : null;
          })}
        </div>
      )}
      <div className="py-3">
        <p className="text-lg text-heading-color">Resistance Multipliers</p>
        <div className={recordListStyles}>
          {ATTACK_ELEMENTS.map((attElmt) => {
            const actualResistance = 10 - totalResistReduct[attElmt];

            return (
              <div key={attElmt} className="pl-2 break-inside-avoid">
                {renderHeading(<span className="capitalize">{attElmt}</span>, getResMult("value", actualResistance))}

                <ul className="pl-4 list-disc">
                  {renderRecord()(
                    {
                      description: `RES base 10% - Reduction ${totalResistReduct[attElmt]}% = ${actualResistance}% or`,
                      value: actualResistance / 100,
                    },
                    0
                  )}

                  {renderRecord((value) => getResMult("equation", value))(
                    {
                      description: "Equation",
                      value: actualResistance,
                    },
                    1
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
