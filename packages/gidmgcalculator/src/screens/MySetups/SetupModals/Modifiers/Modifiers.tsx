import { ArtifactSetBonus } from "@Calculation";
import { CollapseList } from "rond";

import type { UserSetup, UserWeapon } from "@/types";
import type { CalculationResult } from "../../types";

import { useTranslation } from "@/hooks";
import { $AppData } from "@/services";

// Component
import {
  ArtifactBuffsView,
  ArtifactDebuffsView,
  markYellow,
  SelfBuffsView,
  SelfDebuffsView,
  TeammateBuffsView,
  TeammateDebuffsView,
  WeaponBuffsView,
} from "@/components";
import { CustomBuffs, ElementBuffs } from "./buffs";
import { CustomDebuffs, ElementDebuffs } from "./debuffs";

type ModifierWrapperProps = {
  className?: string;
  title: string;
  children: JSX.Element;
};

const ModifierWrapper = ({ className = "", title, children }: ModifierWrapperProps) => {
  return (
    <div className={"shrink-0 " + className}>
      <p className="mb-2 text-lg text-center font-semibold">{title}</p>
      <div className="custom-scrollbar">{children}</div>
    </div>
  );
};

type ModifiersProps = {
  setup: UserSetup;
  result: CalculationResult;
  weapon: UserWeapon;
  setBonuses: ArtifactSetBonus[];
};

export function Modifiers({ setup, result, weapon, setBonuses }: ModifiersProps) {
  const { t } = useTranslation();

  const {
    char,
    party,
    selfBuffCtrls,
    selfDebuffCtrls,
    wpBuffCtrls,
    artBuffCtrls,
    artDebuffCtrls,
    elmtModCtrls,
    customBuffCtrls,
    customDebuffCtrls,
    target,
  } = setup;
  const { teamData } = result;
  const { title, variant, statuses } = $AppData.getTargetInfo(target);

  return (
    <div className="h-full px-4 flex space-x-4">
      <ModifierWrapper title="Debuffs used" className="w-76 flex flex-col">
        <CollapseList
          items={[
            {
              heading: "Resonance & Reactions",
              body: <ElementDebuffs superconduct={elmtModCtrls.superconduct} resonances={elmtModCtrls.resonances} />,
            },
            {
              heading: "Self",
              body: <SelfDebuffsView mutable={false} modCtrls={selfDebuffCtrls} character={char} teamData={teamData} />,
            },
            {
              heading: "Party",
              body: <TeammateDebuffsView mutable={false} teammates={party} teamData={teamData} />,
            },
            {
              heading: "Artifacts",
              body: <ArtifactDebuffsView mutable={false} artDebuffCtrls={artDebuffCtrls} />,
            },
            {
              heading: "Custom",
              body: <CustomDebuffs customDebuffCtrls={customDebuffCtrls} />,
            },
          ]}
        />
      </ModifierWrapper>

      <ModifierWrapper title="Buffs used" className="w-76 flex flex-col">
        <CollapseList
          items={[
            {
              heading: "Resonance & Reactions",
              body: (
                <ElementBuffs
                  charLv={char.level}
                  vision={teamData.activeAppMember.vision}
                  attkBonuses={result.attkBonuses}
                  customInfusion={setup.customInfusion}
                  elmtModCtrls={elmtModCtrls}
                />
              ),
            },
            {
              heading: "Self",
              body: <SelfBuffsView mutable={false} modCtrls={selfBuffCtrls} character={char} teamData={teamData} />,
            },
            {
              heading: "Party",
              body: <TeammateBuffsView mutable={false} teammates={party} teamData={teamData} />,
            },
            {
              heading: "Weapons",
              body: weapon ? (
                <WeaponBuffsView mutable={false} teammates={party} weapon={weapon} wpBuffCtrls={wpBuffCtrls} />
              ) : null,
            },
            {
              heading: "Artifacts",
              body: (
                <ArtifactBuffsView
                  mutable={false}
                  teammates={party}
                  setBonuses={setBonuses}
                  artBuffCtrls={artBuffCtrls}
                />
              ),
            },
            {
              heading: "Custom",
              body: <CustomBuffs customBuffCtrls={customBuffCtrls} />,
            },
          ]}
        />
      </ModifierWrapper>

      <ModifierWrapper title="Target" className="w-68">
        <div className="h-full px-2">
          <p className="text-lg">{title}</p>
          <p>Level: {markYellow(target.level)}</p>

          {variant && <p className="capitalize">{variant}</p>}

          {statuses.length ? (
            <ul className="my-2 pl-4 list-disc">
              {statuses.map((status, i) => {
                return <li key={i}>{status}</li>;
              })}
            </ul>
          ) : null}

          {Object.entries(target.resistances).map(([key, value], i) => (
            <p key={i} className="mt-1">
              <span className={"mr-2 capitalize " + (key === "level" ? "text-primary-1" : `text-${key}`)}>
                {t(key, { ns: "resistance" })}:
              </span>
              <span className="font-medium">{value}%</span>
            </p>
          ))}
        </div>
      </ModifierWrapper>
    </div>
  );
}
