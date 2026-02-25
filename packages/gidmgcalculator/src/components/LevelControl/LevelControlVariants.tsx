import { LevelControl, LevelControlProps } from "./LevelControl";

type CharacterLevelControlProps = Omit<LevelControlProps, "levelCaps">;

export function CharacterLevelControl(props: CharacterLevelControlProps) {
  return (
    <LevelControl
      menuCls={{
        root: "min-w-22",
        capColumn: "min-w-11",
      }}
      {...props}
      className={["min-w-22", props.className]}
      levelCaps={[100, 95, 90, 80, 70, 60, 50, 40, 20]}
    />
  );
}

type WeaponLevelControlProps = Omit<LevelControlProps, "levelCaps"> & {
  rarity?: number;
};

export function WeaponLevelControl(props: WeaponLevelControlProps) {
  const { rarity = 5 } = props;
  const lvCaps = rarity < 3 ? [70, 60, 50, 40, 20] : [90, 80, 70, 60, 50, 40, 20];

  return (
    <LevelControl
      menuCls={{
        root: "min-w-18.5",
        capColumn: "min-w-9",
      }}
      {...props}
      className={["min-w-18.5", props.className]}
      levelCaps={lvCaps}
    />
  );
}
