import { clsx } from "rond";

import type { TargetCalc } from "@/models";

import { ATTACK_ELEMENTS } from "@/constants/global";
import { useTranslation } from "@/hooks";

import { Heading, Container, Item, List } from "./components/ResourceLayout";

type DebuffTrackerProps = {
  listClassName?: string;
  target: TargetCalc;
};

export function DebuffTracker({ listClassName, target }: DebuffTrackerProps) {
  const { t } = useTranslation();

  return (
    <div className="-mt-1 -mb-3 divide-y divide-dark-line">
      <div className={clsx("py-3 empty:hidden", listClassName)}>
        {(["def", ...ATTACK_ELEMENTS] as const).map((attElmt) => {
          const { value: reduction, records = [] } = target.getReduction(attElmt);

          return (
            records.length !== 0 && (
              <div key={attElmt} className="break-inside-avoid">
                <Heading
                  label={`${t(attElmt, { ns: "resistance" })} reduction`}
                  value={reduction + "%"}
                />

                <List records={records} calcFn={(value) => value + "%"} />
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
                <Heading
                  label={
                    <span className="capitalize">{attElmt === "phys" ? "physical" : attElmt}</span>
                  }
                  value={target.resistMults[attElmt]}
                />

                <Container>
                  <Item label={label} value={reducedResistance / 100} />
                  <Item label="Equation" value={target.getResistMultEquation(attElmt)} />
                </Container>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
