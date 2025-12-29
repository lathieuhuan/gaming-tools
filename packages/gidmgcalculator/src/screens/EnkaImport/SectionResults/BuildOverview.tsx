import { FaCalculator } from "react-icons/fa";
import { Button } from "rond";

import type { GenshinUserBuild } from "@/services/enka";

import { BuildArtifacts } from "../_components/BuildArtifacts";
import { BuildCharacter } from "./BuildCharacter";
import { BuildWeapon } from "./BuildWeapon";

type BuildOverviewProps = {
  build: GenshinUserBuild;
  onSave?: () => void;
  onCalculate?: () => void;
};

export function BuildOverview({ build, onSave, onCalculate }: BuildOverviewProps) {
  const { name } = build;
  const { basic, data } = build.character;
  const buildName = name || data.name;

  return (
    <div className="px-3 py-4 bg-dark-1 rounded-lg overflow-hidden">
      <div className="flex">
        <BuildCharacter build={build} />

        <div className="ml-3 text-sm">
          <p className={`text-lg font-bold text-${data.vision}`}>{buildName}</p>
          <p>
            {basic.level} <span className="text-light-hint opacity-50">|</span> C{basic.cons}{" "}
            <span className="text-light-hint opacity-50">|</span> {basic.NAs} - {basic.ES} -{" "}
            {basic.EB}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          {/* <Button icon={<FaSave />} onClick={onSave} /> */}
          <Button icon={<FaCalculator />} onClick={onCalculate} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2">
        <BuildWeapon build={build} />
        <BuildArtifacts build={build} />
      </div>
    </div>
  );
}

export function BuildOverviewMobile({ build, onSave, onCalculate }: BuildOverviewProps) {
  const { name } = build;
  const { basic, data } = build.character;
  const buildName = name || data.name;

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="px-3 py-4 bg-dark-1 rounded-lg rounded-tr-none">
        <div className="flex">
          <BuildCharacter build={build} />

          <div className="ml-3 text-sm">
            <p className={`text-lg font-bold text-${data.vision}`}>{buildName}</p>
            <p>
              {basic.level} <span className="text-light-hint opacity-50">|</span> C{basic.cons}
            </p>
            <p>
              {basic.NAs} - {basic.ES} - {basic.EB}
            </p>
          </div>

          <BuildWeapon className="ml-auto size-16" build={build} />
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2">
          <BuildArtifacts build={build} />
        </div>
      </div>

      <div className="flex">
        <div className="grow flex relative">
          <div className="ml-auto w-1/2 bg-dark-1" />
          <div className="absolute inset-0 z-1 bg-dark-2 rounded-tr-lg" />
        </div>

        <div className="pt-2 pb-3 px-3 bg-dark-1 rounded-b-lg flex gap-2">
          {/* <Button icon={<FaSave />} onClick={onSave} /> */}
          <Button icon={<FaCalculator />} onClick={onCalculate} />
        </div>

        <div className="grow flex relative">
          <div className="mr-auto w-1/2 bg-dark-1" />
          <div className="absolute inset-0 z-1 bg-dark-2 rounded-tl-lg" />
        </div>
      </div>
    </div>
  );
}
