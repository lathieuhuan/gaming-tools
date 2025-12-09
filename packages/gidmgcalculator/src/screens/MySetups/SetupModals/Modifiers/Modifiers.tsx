import { CollapseList } from "rond";

import type { CalcSetup } from "@/models/calculator";

import { useTranslation } from "@/hooks";
import { $AppData } from "@/services";
import Object_ from "@/utils/Object";

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
import { CustomBuffs, ElementBuffs, TeamBuffs } from "./buffs";
import { CustomDebuffs, ElementDebuffs } from "./debuffs";

type SectionLayoutProps = {
  className?: string;
  title?: string;
  children: JSX.Element;
};

const SectionLayout = ({ className = "", title, children }: SectionLayoutProps) => {
  return (
    <div className={"shrink-0 " + className}>
      <p className="mb-2 text-lg text-center font-semibold">{title}</p>
      <div className="custom-scrollbar">{children}</div>
    </div>
  );
};

type ModifiersProps = {
  setup: CalcSetup;
};

export function Modifiers({ setup }: ModifiersProps) {
  const { t } = useTranslation();

  const { main, target } = setup;
  const { title, variant, statuses } = $AppData.getTargetInfo(target);

  return (
    <div className="h-full px-4 flex space-x-4" onDoubleClick={() => console.log(setup)}>
      <SectionLayout title="Debuffs used" className="w-76 flex flex-col">
        <CollapseList
          items={[
            {
              heading: "Resonance & Reactions",
              body: (
                <ElementDebuffs
                  superconduct={setup.elmtEvent.superconduct}
                  rsnDebuffCtrls={setup.rsnDebuffCtrls}
                />
              ),
            },
            {
              heading: "Self",
              body: (
                <SelfDebuffsView
                  mutable={false}
                  modCtrls={setup.selfDebuffCtrls}
                  character={main}
                />
              ),
            },
            {
              heading: "Teammates",
              body: <TeammateDebuffsView mutable={false} teammates={setup.teammates} />,
            },
            {
              heading: "Artifacts",
              body: <ArtifactDebuffsView mutable={false} artDebuffCtrls={setup.artDebuffCtrls} />,
            },
            {
              heading: "Custom",
              body: <CustomDebuffs customDebuffCtrls={setup.customDebuffCtrls} />,
            },
          ]}
        />
      </SectionLayout>

      <SectionLayout title="Buffs used" className="w-76 flex flex-col">
        <CollapseList
          items={[
            {
              heading: "Team Bonuses",
              body: <TeamBuffs setup={setup} />,
            },
            {
              heading: "Elemental Events",
              body: <ElementBuffs character={main} elmtEvent={setup.elmtEvent} />,
            },
            {
              heading: "Self",
              body: (
                <SelfBuffsView mutable={false} character={main} modCtrls={setup.selfBuffCtrls} />
              ),
            },
            {
              heading: "Teammates",
              body: <TeammateBuffsView mutable={false} teammates={setup.teammates} />,
            },
            {
              heading: "Weapons",
              body: (
                <WeaponBuffsView
                  mutable={false}
                  teammates={setup.teammates}
                  weapon={main.weapon}
                  wpBuffCtrls={setup.wpBuffCtrls}
                />
              ),
            },
            {
              heading: "Artifacts",
              body: (
                <ArtifactBuffsView
                  mutable={false}
                  teammates={setup.teammates}
                  artBuffCtrls={setup.artBuffCtrls}
                />
              ),
            },
            {
              heading: "Custom",
              body: <CustomBuffs customBuffCtrls={setup.customBuffCtrls} />,
            },
          ]}
        />
      </SectionLayout>

      <SectionLayout title="Target" className="w-68">
        <div className="h-full px-2">
          <p className="text-lg">{title}</p>
          <p className="my-1">Level: {markYellow(target.level)}</p>

          {variant && <p className="capitalize">{variant}</p>}

          {statuses.length ? (
            <ul className="my-2 pl-4 list-disc">
              {statuses.map((status, i) => {
                return <li key={i}>{status}</li>;
              })}
            </ul>
          ) : null}

          {Object_.entries(target.resistances).map(([key, value], i) => (
            <p key={i} className="mt-1">
              <span className={"mr-2 capitalize"}>{t(key, { ns: "resistance" })}:</span>
              <span className={`font-medium text-${key}`}>{value}%</span>
            </p>
          ))}
        </div>
      </SectionLayout>
    </div>
  );
}
