import { Fragment } from "react";

import type { CalcCharacter } from "@/models/base";
import type { AttackReaction, CustomBuffCtrl, ElementalEvent, ElementType } from "@/types";
import type { IUserSetup } from "../../types";

import { useTranslation } from "@/hooks";
import { suffixOf, toCustomBuffLabel } from "@/utils";
import { parseDescription } from "@/utils/description-parsers";

// Component
import {
  AutoResonanceBuffs,
  GenshinModifierView,
  ModifierContainer,
  QuickenBuffItem,
  ResonanceBuffItem,
  VapMeltBuffItem,
} from "@/components";

type TeamBuffsProps = {
  setup: IUserSetup;
};

export function TeamBuffs({ setup }: TeamBuffsProps) {
  const { team, rsnBuffCtrls, teamBuffCtrls } = setup;
  const content: JSX.Element[] = [];

  if (team.resonances.length || rsnBuffCtrls.length) {
    content.push(
      <div>
        <AutoResonanceBuffs resonances={team.resonances} />

        {rsnBuffCtrls.map((ctrl) => {
          return <ResonanceBuffItem key={ctrl.element} mutable={false} element={ctrl.element} />;
        })}
      </div>
    );
  }

  if (teamBuffCtrls.length) {
    content.push(
      <div>
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

type ElementBuffsProps = {
  character: CalcCharacter;
  elmtEvent: ElementalEvent;
};

export function ElementBuffs({ character, elmtEvent }: ElementBuffsProps) {
  const { absorption, absorbReaction, reaction, infusion, infuseReaction } = elmtEvent;
  const headingCls = "text-sm text-secondary-1 mb-1";

  const content: JSX.Element[] = [];

  const renderReaction = (reaction: AttackReaction, element: ElementType) => {
    if (reaction === "melt" || reaction === "vaporize") {
      return (
        <VapMeltBuffItem
          mutable={false}
          reaction={reaction}
          element={element}
          character={character}
        />
      );
    }

    if (reaction === "spread" || reaction === "aggravate") {
      return (
        <QuickenBuffItem
          mutable={false}
          reaction={reaction}
          element={element}
          character={character}
        />
      );
    }

    return null;
  };

  if (absorption) {
    content.push(
      <div>
        <p className={headingCls}>Anemo Swirl / Element Absorption</p>
        <p>Element: {absorption}</p>
        {renderReaction(absorbReaction, absorption)}
      </div>
    );
  }

  if (reaction) {
    content.push(
      <div>
        <p className={headingCls}>Reaction by elemental attacks</p>
        {renderReaction(reaction, character.data.vision)}
      </div>
    );
  }

  if (infusion) {
    content.push(
      <div>
        <p className={headingCls}>Infusion</p>
        <p>Element: {infusion}</p>
        {renderReaction(infuseReaction, infusion)}
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
