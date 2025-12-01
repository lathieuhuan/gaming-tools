import { Fragment } from "react";

import type { CustomBuffCtrl, ElementType, Level, AttackBonus, AttackReaction } from "@/types";
import { useTranslation } from "@/hooks";
import { suffixOf, toCustomBuffLabel } from "@/utils";

// Component
import {
  VapMeltBuffItem,
  QuickenBuffItem,
  ResonanceBuffItem,
  ModifierContainer,
} from "@/components";

type ElementBuffsProps = {
  charLv: Level;
  elmtModCtrls: ElementModCtrl;
  attkBonuses: AttackBonuses;
  vision: ElementType;
  customInfusion: Infusion;
};

export function ElementBuffs({
  charLv,
  elmtModCtrls,
  attkBonuses,
  vision,
  customInfusion,
}: ElementBuffsProps) {
  const content: JSX.Element[] = [];
  const { resonances, reaction, infuse_reaction, absorption } = elmtModCtrls;
  const headingCls = "text-sm text-secondary-1 mb-1";

  if (resonances.length) {
    content.push(
      <div>
        <p className={headingCls}>Resonance</p>
        {resonances.map(({ vision: resonanceType }) => {
          return <ResonanceBuffItem key={resonanceType} mutable={false} element={resonanceType} />;
        })}
      </div>
    );
  }

  const renderReaction = (reaction: AttackReaction, element: ElementType) => {
    return reaction === "melt" || reaction === "vaporize" ? (
      <VapMeltBuffItem mutable={false} {...{ reaction, element, attkBonuses }} />
    ) : reaction === "spread" || reaction === "aggravate" ? (
      <QuickenBuffItem
        mutable={false}
        {...{ reaction, element, characterLv: charLv, attkBonuses }}
      />
    ) : null;
  };

  if (absorption) {
    content.push(
      <div>
        <p className={headingCls}>Reaction by element-absorbing attacks</p>
        {renderReaction(reaction, absorption)}
      </div>
    );
  } else if (reaction) {
    content.push(
      <div>
        <p className={headingCls}>Reaction by elemental attacks</p>
        {renderReaction(reaction, vision)}
      </div>
    );
  }

  if (customInfusion.element !== "phys") {
    content.push(
      <div>
        <p className={headingCls}>Reaction by infused attacks</p>
        {renderReaction(infuse_reaction, customInfusion.element)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.map((item, index) => {
        return (
          <Fragment key={index}>
            {index ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-3" /> : null}
            {item}
          </Fragment>
        );
      })}
    </div>
  );
}

type CustomBuffsProps = {
  customBuffCtrls: CustomBuffCtrl[];
};

export function CustomBuffs({ customBuffCtrls }: CustomBuffsProps) {
  const { t } = useTranslation();

  return (
    <ModifierContainer type="buffs" mutable={false}>
      {customBuffCtrls.map(({ category, type, subType, value }, index) => (
        <div key={index} className="flex justify-end">
          <p className="mr-4">{toCustomBuffLabel(category, type, t)}</p>
          <p className="w-12 shrink-0 text-heading text-right">
            {value}
            {suffixOf(subType || type)}
          </p>
        </div>
      ))}
    </ModifierContainer>
  );
}
