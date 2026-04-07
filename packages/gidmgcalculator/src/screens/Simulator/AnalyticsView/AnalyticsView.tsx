import { formatNumber, round } from "ron-utils";
import { clsx } from "rond";

import type { Character } from "@/models";
import { selectProcessor, selectSimulation, useSimulatorStore } from "../store";

type MemberDamageCalc = {
  member: Character;
  value: number;
};

type AnalyticsViewProps = {
  className?: string;
};

export function AnalyticsView({ className }: AnalyticsViewProps) {
  const members = useSimulatorStore((state) => selectSimulation(state).members);
  const hitLogs = useSimulatorStore((state) => selectProcessor(state).hitLogs);

  let totalDMG = 0;

  const totalsByMember = Object.values(members).reduce<Record<number, MemberDamageCalc>>(
    (acc, member) => {
      acc[member.data.code] = { member, value: 0 };
      return acc;
    },
    {}
  );

  for (const log of hitLogs) {
    totalDMG += log.value;

    switch (log.type) {
      case "C": {
        totalsByMember[log.performer].value += log.value;
        break;
      }
      case "E":
        break;
      default:
        log satisfies never;
    }
  }

  const sortedMemberDamageCalcs: MemberDamageCalc[] = Object.values(totalsByMember).sort(
    (a, b) => b.value - a.value
  );

  return (
    <div className={clsx("space-y-6", className)}>
      <div className="pt-2 flex items-end gap-4">
        <span className="text-light-4 leading-none">Total DMG</span>
        <span className="text-2xl leading-none font-bold">{formatNumber(totalDMG)}</span>
      </div>

      <div>
        <p className="text-xs text-light-hint uppercase">Damage by Member</p>

        <div className="mt-2">
          <table>
            <tbody>
              {sortedMemberDamageCalcs.map((calc) => {
                const { code, name } = calc.member.data;
                const percentage = calc.value ? (calc.value / totalDMG) * 100 : 0;

                return (
                  <tr key={code}>
                    <td className="text-light-2 whitespace-nowrap">{name}</td>
                    <td className="pl-4 pr-2 text-right text-xl font-semibold">
                      {formatNumber(calc.value)}
                    </td>
                    <td className="text-right text-light-4 text-sm">({round(percentage, 2)}%)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
