import { FaCalculator } from "react-icons/fa";
import { Button } from "rond";

import { GenshinUserBuild } from "@/services/enka";
import { ARTIFACT_TYPES } from "@Calculation";
import { useSelectedBuildState } from "../DataImportProvider";

import { BuildArtifact } from "../_components/BuildArtifact";
import { BuildCharacter } from "./BuildCharacter";
import { BuildWeapon } from "./BuildWeapon";

type BuildOverviewProps = {
  build: GenshinUserBuild;
  onSave?: () => void;
  onCalculate?: () => void;
};

export function BuildOverview({ build, onSave, onCalculate }: BuildOverviewProps) {
  const { name, character } = build;
  const buildName = name || character?.name;

  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  return (
    <div className="px-3 py-4 bg-dark-1 rounded-lg overflow-hidden">
      <div className="flex">
        <BuildCharacter build={build} />

        <div className="ml-3 text-sm">
          <p className={`text-lg font-bold text-${character.data.vision}`}>{buildName}</p>
          <p>
            {character.level} <span className="text-light-hint opacity-50">|</span> C
            {character.cons} <span className="text-light-hint opacity-50">|</span> {character.NAs} -{" "}
            {character.ES} - {character.EB}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          {/* <Button icon={<FaSave />} onClick={onSave} /> */}
          <Button icon={<FaCalculator />} onClick={onCalculate} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <BuildWeapon className="size-14" build={build} />

        {build.artifacts.map((artifact, index) => (
          <BuildArtifact
            key={index}
            className="size-14"
            artifact={artifact}
            selectedBuild={selectedBuild}
            artifactType={ARTIFACT_TYPES[index]}
            onClick={() => setSelectedBuild({ ...build, detailType: index })}
          />
        ))}
      </div>
    </div>
  );
}

export function BuildOverviewMobile({ build, onSave, onCalculate }: BuildOverviewProps) {
  const { name, character } = build;
  const buildName = name || character?.name;

  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="px-3 py-4 bg-dark-1 rounded-lg rounded-tr-none">
        <div className="flex">
          <BuildCharacter build={build} />

          <div className="ml-3 text-sm">
            <p className={`text-lg font-bold text-${character.data.vision}`}>{buildName}</p>
            <p>
              {character.level} <span className="text-light-hint opacity-50">|</span> C
              {character.cons}
            </p>
            <p>
              {character.NAs} - {character.ES} - {character.EB}
            </p>
          </div>

          <BuildWeapon className="ml-auto size-16" build={build} />
        </div>

        <div className="mt-4 flex gap-2">
          {build.artifacts.map((artifact, index) => (
            <BuildArtifact
              key={index}
              artifact={artifact}
              selectedBuild={selectedBuild}
              artifactType={ARTIFACT_TYPES[index]}
              onClick={() => setSelectedBuild({ ...build, detailType: index })}
            />
          ))}
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
