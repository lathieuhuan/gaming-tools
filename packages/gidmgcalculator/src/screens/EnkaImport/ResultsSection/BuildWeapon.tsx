import { ItemCase } from "rond";

import { ItemThumbnail } from "@/components";
import { GenshinUserBuild } from "@/services/enka";
import { useSelectedBuildState } from "../SelectedBuildProvider";

type BuildWeaponProps = {
  className?: string;
  build: GenshinUserBuild;
};

export function BuildWeapon({ className, build }: BuildWeaponProps) {
  const { weapon } = build;

  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  const selected = weapon.ID === selectedBuild?.weapon.ID && selectedBuild?.detailType === "WEAPON";

  return (
    <ItemCase
      className={className}
      chosen={selected}
      onClick={() => setSelectedBuild({ ...build, detailType: "WEAPON" })}
    >
      {(className, imgCls) => (
        <ItemThumbnail
          className={className}
          imgCls={imgCls}
          item={{
            icon: weapon.data.icon,
            level: weapon.level,
            rarity: weapon.data.rarity,
            refi: weapon.refi,
          }}
          compact
        />
      )}
    </ItemCase>
  );
}
