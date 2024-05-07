import { round } from "rond";
import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  ATTACK_PATTERN_INFO_KEYS,
  REACTIONS,
  TrackerResult,
} from "@Backend";

import { useTranslation } from "@Src/hooks";
import { Utils_ } from "@Src/utils";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

interface BonusesTrackerProps extends Partial<Pick<TrackerResult, "attPattBonus" | "attElmtBonus" | "rxnBonus">> {
  em?: number;
}

export function BonusesTracker({ attPattBonus, attElmtBonus, rxnBonus, em }: BonusesTrackerProps) {
  const { t } = useTranslation();

  const hasAttPattBonus = attPattBonus && Object.values(attPattBonus).some((records) => records.length);
  const hasAttElmtBonus = attElmtBonus && Object.values(attElmtBonus).some((records) => records.length);
  const hasRxnBonus = rxnBonus && Object.values(rxnBonus).some((records) => records.length);

  if (!hasAttPattBonus && !hasAttElmtBonus && !hasRxnBonus && !em) {
    return (
      <div className="h-16 flex-center text-hint-color">
        <p>No bonuses</p>
      </div>
    );
  }

  const ATTACK_PATTERN_BONUS__KEYS = ["all", ...ATTACK_PATTERNS] as const;

  return (
    <div className="pl-2 -mt-1 -mb-3 divide-y divide-surface-border">
      {hasAttPattBonus ? (
        <div className={"py-3 " + recordListStyles}>
          {ATTACK_PATTERN_BONUS__KEYS.map((attPatt) => {
            const noRecord = ATTACK_PATTERN_INFO_KEYS.every((infoKey) => {
              return attPattBonus[`${attPatt}.${infoKey}`].length === 0;
            });

            if (noRecord) return null;

            return (
              <div key={attPatt} className="break-inside-avoid">
                <p className="text-heading-color capitalize">{t(attPatt)}</p>

                {ATTACK_PATTERN_INFO_KEYS.map((infoKey) => {
                  const records = attPattBonus[`${attPatt}.${infoKey}`];
                  const percent = Utils_.suffixOf(infoKey);

                  return records.length ? (
                    <div key={infoKey} className="pl-2">
                      {renderHeading(t(infoKey), getTotalRecordValue(records) + percent)}

                      <ul className="pl-4 list-disc">
                        {records.map(renderRecord((value) => round(value, 1) + percent))}
                      </ul>
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
        </div>
      ) : null}

      {hasAttElmtBonus ? (
        <div className={"py-3 " + recordListStyles}>
          {ATTACK_ELEMENTS.map((attElmt) => {
            const noRecord = ATTACK_ELEMENT_INFO_KEYS.every((infoKey) => {
              return attElmtBonus[`${attElmt}.${infoKey}`].length === 0;
            });

            if (noRecord) return null;

            return (
              <div key={attElmt} className="break-inside-avoid">
                <p className="text-heading-color capitalize">{attElmt} DMG</p>

                {ATTACK_ELEMENT_INFO_KEYS.map((infoKey) => {
                  const records = attElmtBonus[`${attElmt}.${infoKey}`];
                  const percent = Utils_.suffixOf(infoKey);

                  return records.length ? (
                    <div key={infoKey} className="mt-1 pl-2">
                      {renderHeading(t(infoKey), getTotalRecordValue(records) + percent)}

                      <ul className="pl-4 list-disc">
                        {records.map(renderRecord((value) => round(value, 1) + percent))}
                      </ul>
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
        </div>
      ) : null}

      {hasRxnBonus || em ? (
        <div className={"py-3 " + recordListStyles}>
          {REACTIONS.map((reaction) => {
            const records = rxnBonus?.[`${reaction}.pct_`] || [];

            return records.length || em ? (
              <div key={reaction} className="break-inside-avoid">
                {renderHeading(t(reaction), round(getTotalRecordValue(records), 1) + "%")}

                <ul className="pl-4 list-disc">{records.map(renderRecord((value) => round(value, 1) + "%"))}</ul>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}
