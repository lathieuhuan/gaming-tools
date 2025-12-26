import { useState } from "react";
import { clsx, Table } from "rond";

import { ARTIFACT_TYPES } from "@/constants/global";
import { GenshinUserBuild } from "@/services/enka";
import { ExistedItems, SaveSelections, SaveSelectionType } from "../types";

import { CharacterPortrait, ItemThumbnail } from "@/components";
import { ConfigLabel } from "./ConfigLabel";
import { SaveConfig } from "./SaveConfig";

const getInitialValues = (existedItems?: ExistedItems) => {
  const result: SaveSelections = {
    character: existedItems?.character ? "OVERWRITE" : "NEW",
    weapon: existedItems?.weapon ? "OVERWRITE" : "NEW",
  };

  ARTIFACT_TYPES.forEach((type) => {
    result[type] = existedItems?.[type] ? "OVERWRITE" : "NEW";
  });

  return result;
};

export type SaveFormProps = {
  id?: string;
  className?: string;
  build: GenshinUserBuild;
  existedItems?: ExistedItems;
  onSubmit?: (values: SaveSelections, build: GenshinUserBuild) => void;
};

export function SaveForm({ id, className, build, existedItems, onSubmit }: SaveFormProps) {
  const [values, setValues] = useState(getInitialValues(existedItems));

  const handleChange = (key: keyof SaveSelections) => (type: SaveSelectionType) => {
    setValues((prev) => ({ ...prev, [key]: type }));
  };

  return (
    <form
      id={id}
      className={clsx("custom-scrollbar relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(values, build);
      }}
    >
      <Table>
        <Table.Tr className="sticky top-0 z-10 bg-dark-1">
          <Table.Th className="border-0 border-r border-dark-line" />
          <Table.Th className="border-0 border-l border-dark-line">Don't save</Table.Th>
          <Table.Th className="border-0 border-l border-dark-line">Overwrite</Table.Th>
          <Table.Th className="border-0 border-l border-dark-line">Save New</Table.Th>
        </Table.Tr>

        <SaveConfig
          name="character"
          label={
            <ConfigLabel>
              <CharacterPortrait size="small" info={build.character.data} />
            </ConfigLabel>
          }
          overwritable={!!existedItems?.character}
          value={values.character}
          onChange={handleChange("character")}
        />
        <SaveConfig
          name="weapon"
          label={
            <ConfigLabel owner={existedItems?.weapon?.owner}>
              <ItemThumbnail compact item={build.weapon.data} />
            </ConfigLabel>
          }
          overwritable={!!existedItems?.weapon}
          value={values.weapon}
          onChange={handleChange("weapon")}
        />
        {build.artifacts.map((artifact) => {
          return (
            artifact && (
              <SaveConfig
                key={artifact.type}
                name={artifact.type}
                label={
                  <ConfigLabel owner={existedItems?.[artifact.type]?.owner}>
                    <ItemThumbnail
                      compact
                      item={{ icon: artifact.data[artifact.type].icon, rarity: artifact.rarity }}
                    />
                  </ConfigLabel>
                }
                overwritable={!!existedItems?.[artifact.type]}
                value={values[artifact.type]}
                onChange={handleChange(artifact.type)}
              />
            )
          );
        })}
      </Table>
    </form>
  );
}
