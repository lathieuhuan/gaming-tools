import { Fragment } from "react";

import type { CalcSetup, Character } from "@/models";
import type { AttackReaction, CustomBuffCtrl, ElementalEvent, ElementType } from "@/types";

import { useTranslation } from "@/hooks";
import { parseDescription } from "@/utils/descriptionParsers";
import { suffixOf, toCustomBuffLabel } from "@/utils/pure.utils";

// Component
import {
  AutoResonanceBuffs,
  GenshinModifierView,
  ModifierContainer,
  QuickenBuffItem,
  ResonanceBuffItem,
  VapMeltBuffItem,
  WithEmptyMessage,
} from "@/components";

type TeamBuffsProps = {
  setup: CalcSetup;
};

export function TeamBuffs({ setup }: TeamBuffsProps) {
  const { team, rsnBuffCtrls, teamBuffCtrls } = setup;
  const content: JSX.Element[] = [];

  if (team.resonances.length || rsnBuffCtrls.length) {
    content.push(
      <div className="space-y-2">
        <AutoResonanceBuffs resonances={team.resonances} />

        {rsnBuffCtrls.map((ctrl) => {
          return (
            <ResonanceBuffItem
              key={ctrl.element}
              mutable={false}
              element={ctrl.element}
              inputs={ctrl.inputs}
            />
          );
        })}
      </div>
    );
  }

  if (teamBuffCtrls.length) {
    content.push(
      <div className="space-y-2">
        {teamBuffCtrls.map((ctrl) => {
          const data = ctrl.data;

          return (
            <GenshinModifierView
              key={ctrl.id}
              mutable={false}
              heading={data.src}
              description={parseDescription(data.description)}
              inputConfigs={data.inputConfigs}
              checked={ctrl.activated}
              inputs={ctrl.inputs}
            />
          );
        })}
      </div>
    );
  }

  return (
    <WithEmptyMessage message="No buffs found">
      {content.map((item, index) => {
        return (
          <Fragment key={index}>
            {index ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-3" /> : null}
            {item}
          </Fragment>
        );
      })}
    </WithEmptyMessage>
  );
}

type ElementBuffProps = {
  element: ElementType;
  heading: string;
  reaction: AttackReaction;
  character: Character;
  showElement?: boolean;
};

function ElementBuff({
  element,
  heading,
  reaction,
  character,
  showElement = true,
}: ElementBuffProps) {
  let reactionRender: JSX.Element | null = null;

  if (reaction === "melt" || reaction === "vaporize") {
    reactionRender = (
      <VapMeltBuffItem
        mutable={false}
        reaction={reaction}
        element={element}
        character={character}
      />
    );
  }

  if (reaction === "spread" || reaction === "aggravate") {
    reactionRender = (
      <QuickenBuffItem
        mutable={false}
        reaction={reaction}
        element={element}
        character={character}
      />
    );
  }

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm text-heading">{heading}</p>
        {showElement && <p className={`capitalize text-${element}`}>{element}</p>}
      </div>
      {reactionRender}
    </div>
  );
}

type ElementBuffsProps = {
  character: Character;
  elmtEvent: ElementalEvent;
};

export function ElementBuffs({ character, elmtEvent }: ElementBuffsProps) {
  const { absorption, absorbReaction, reaction, infusion, infuseReaction } = elmtEvent;
  const content: JSX.Element[] = [];

  if (absorption) {
    content.push(
      <ElementBuff
        element={absorption}
        heading="Anemo Swirl / Element Absorption"
        reaction={absorbReaction}
        character={character}
      />
    );
  }

  if (reaction) {
    content.push(
      <ElementBuff
        element={character.data.vision}
        heading="Reaction by elemental attacks"
        reaction={reaction}
        character={character}
        showElement={false}
      />
    );
  }

  if (infusion) {
    content.push(
      <ElementBuff
        element={infusion}
        heading="Infusion"
        reaction={infuseReaction}
        character={character}
      />
    );
  }

  return (
    <WithEmptyMessage className="space-y-2" message="No buffs found">
      {content.map((item, index) => {
        return (
          <Fragment key={index}>
            {index ? <div className="mx-auto my-3 w-1/2 h-px bg-dark-3" /> : null}
            {item}
          </Fragment>
        );
      })}
    </WithEmptyMessage>
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
          <p className="w-12 shrink-0 text-secondary-1 text-right">
            {value}
            {suffixOf(subType || type)}
          </p>
        </div>
      ))}
    </ModifierContainer>
  );
}
