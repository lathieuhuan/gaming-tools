import { Fragment } from "react";
import type {
  CustomBuffCtrl,
  ElementModCtrl,
  ReactionBonus,
  ElementType,
  Level,
  AttackElement,
  AttackReaction,
} from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { suffixOf, toCustomBuffLabel } from "@Src/utils";

// Component
import { renderModifiers, VapMeltBuffItem, QuickenBuffItem, ResonanceBuffItem } from "@Src/components";

interface ElementBuffsDetailProps {
  charLv: Level;
  elmtModCtrls: ElementModCtrl;
  infusedElement: AttackElement;
  rxnBonus: ReactionBonus;
  elementType: ElementType;
}
export function ElementBuffsDetail({
  charLv,
  elmtModCtrls,
  infusedElement,
  rxnBonus,
  elementType,
}: ElementBuffsDetailProps) {
  const content: JSX.Element[] = [];
  const { resonances, reaction, infuse_reaction, absorption } = elmtModCtrls;

  if (resonances.length) {
    content.push(
      <div>
        <p className="text-mint-600">Resonance</p>
        {resonances.map(({ vision: resonanceType }) => {
          return <ResonanceBuffItem key={resonanceType} mutable={false} element={resonanceType} />;
        })}
      </div>
    );
  }

  const renderReaction = (reaction: AttackReaction, element: ElementType) => {
    return reaction === "melt" || reaction === "vaporize" ? (
      <VapMeltBuffItem mutable={false} {...{ reaction, element, rxnBonus }} />
    ) : reaction === "spread" || reaction === "aggravate" ? (
      <QuickenBuffItem mutable={false} {...{ reaction, element, characterLv: charLv, rxnBonus }} />
    ) : null;
  };

  if (absorption) {
    content.push(
      <div>
        <p className="text-mint-600">Reaction by Element-absorbing attacks</p>
        {renderReaction(reaction, absorption)}
      </div>
    );
  } else if (reaction) {
    content.push(
      <div>
        <p>Reaction</p>
        {renderReaction(reaction, elementType)}
      </div>
    );
  }

  if (infusedElement !== "phys") {
    content.push(
      <div>
        <p className="text-mint-600">Reaction by Infused attacks</p>
        {renderReaction(infuse_reaction, infusedElement)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.map((item, index) => {
        return (
          <Fragment key={index}>
            {index ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-500" /> : null}
            {item}
          </Fragment>
        );
      })}
    </div>
  );
}

interface CustomBuffsDetailProps {
  customBuffCtrls: CustomBuffCtrl[];
}
export function CustomBuffsDetail({ customBuffCtrls }: CustomBuffsDetailProps) {
  const { t } = useTranslation();

  const content = customBuffCtrls.map(({ category, type, subType, value }, i) => (
    <div key={i} className="flex justify-end">
      <p className="mr-4">{toCustomBuffLabel(category, type, t)}</p>
      <p className="w-12 shrink-0 text-orange-500 text-right">
        {value}
        {suffixOf(subType || type)}
      </p>
    </div>
  ));

  return renderModifiers(content, "buffs", false);
}
