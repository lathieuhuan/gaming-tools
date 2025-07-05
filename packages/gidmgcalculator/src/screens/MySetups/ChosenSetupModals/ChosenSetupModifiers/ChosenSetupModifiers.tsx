import { CollapseList } from "rond";
import { ArtifactSetBonus } from "@Calculation";

import type { UserSetup, UserWeapon } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { $AppData } from "@Src/services";
import { calculateChosenSetup } from "../../MySetups.utils";

// Component
import { markYellow } from "@Src/components";
import {
  WeaponBuffsView,
  ArtifactBuffsView,
  ArtifactDebuffsView,
  SelfBuffsView,
  SelfDebuffsView,
  PartyBuffsView,
  PartyDebuffsView,
} from "@Src/components";
import { CustomBuffsDetail, ElementBuffsDetail } from "./buffs";
import { CustomDebuffsDetail, ElementDebuffsDetail } from "./debuffs";

interface ModifierWrapperProps {
  className?: string;
  title: string;
  children: JSX.Element;
}
const ModifierWrapper = ({ className = "", title, children }: ModifierWrapperProps) => {
  return (
    <div className={"shrink-0 " + className}>
      <p className="mb-2 text-lg text-center font-semibold">{title}</p>
      <div className="custom-scrollbar">{children}</div>
    </div>
  );
};

interface ChosenSetupModifiersProps {
  chosenSetup: UserSetup;
  result: NonNullable<ReturnType<typeof calculateChosenSetup>>;
  weapon: UserWeapon;
  setBonuses: ArtifactSetBonus[];
}
export function ChosenSetupModifiers({ chosenSetup, result, weapon, setBonuses }: ChosenSetupModifiersProps) {
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
  } = chosenSetup;
  const { characterData } = result;
  const { title, variant, statuses } = $AppData.getTargetInfo(target);

  return (
    <div className="h-full px-4 flex space-x-4">
      <ModifierWrapper title="Debuffs used" className="w-76 flex flex-col">
        <CollapseList
          items={[
            {
              heading: "Resonance & Reactions",
              body: (
                <ElementDebuffsDetail superconduct={elmtModCtrls.superconduct} resonances={elmtModCtrls.resonances} />
              ),
            },
            {
              heading: "Self",
              body: (
                <SelfDebuffsView
                  mutable={false}
                  modCtrls={selfDebuffCtrls}
                  character={char}
                  characterData={characterData}
                />
              ),
            },
            {
              heading: "Party",
              body: <PartyDebuffsView mutable={false} party={party} characterData={characterData} />,
            },
            {
              heading: "Artifacts",
              body: <ArtifactDebuffsView mutable={false} artDebuffCtrls={artDebuffCtrls} />,
            },
            {
              heading: "Custom",
              body: <CustomDebuffsDetail customDebuffCtrls={customDebuffCtrls} />,
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
                <ElementBuffsDetail
                  charLv={char.level}
                  vision={characterData.appCharacter.vision}
                  attkBonuses={result.attkBonuses}
                  customInfusion={chosenSetup.customInfusion}
                  elmtModCtrls={elmtModCtrls}
                />
              ),
            },
            {
              heading: "Self",
              body: (
                <SelfBuffsView
                  mutable={false}
                  modCtrls={selfBuffCtrls}
                  character={char}
                  characterData={characterData}
                />
              ),
            },
            {
              heading: "Party",
              body: <PartyBuffsView mutable={false} party={party} characterData={characterData} />,
            },
            {
              heading: "Weapons",
              body: weapon ? <WeaponBuffsView mutable={false} {...{ weapon, wpBuffCtrls, party }} /> : null,
            },
            {
              heading: "Artifacts",
              body: <ArtifactBuffsView mutable={false} {...{ setBonuses, artBuffCtrls, party }} />,
            },
            {
              heading: "Custom",
              body: <CustomBuffsDetail customBuffCtrls={customBuffCtrls} />,
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
