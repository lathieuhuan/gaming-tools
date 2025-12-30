import { useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { Button, notification, Table } from "rond";

import type { Artifact } from "@/models/base";
import type { IArtifactBasic } from "@/types";

import { useTranslation } from "@/hooks/useTranslation";
import { suffixOf } from "@/utils";
import Object_ from "@/utils/Object";
import { useDispatch } from "@Store/hooks";
import { updateUserArtifact } from "@Store/userdb-slice";

import { ItemSaveOption } from "../_components/ItemSaveOption";

const comparedFields: (keyof IArtifactBasic)[] = ["rarity", "level", "mainStatType", "subStats"];

type ArtifactSaveMenuProps = {
  items: IArtifactBasic[];
  artifact: Artifact;
  onUpdate?: (item: IArtifactBasic) => void;
};

export function ArtifactSaveMenu({ items, artifact, onUpdate }: ArtifactSaveMenuProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const diffMap = useRef(new Map<number, boolean>());
  const [expandedId, setExpandedId] = useState(-1);

  const isDifferent = (item: IArtifactBasic) => {
    const different = !isEqual(
      Object_.pickProps(item, comparedFields),
      Object_.pickProps(artifact, comparedFields)
    );

    diffMap.current.set(item.ID, different);

    return different;
  };

  const handleUpdate = (item: IArtifactBasic) => {
    dispatch(
      updateUserArtifact({
        ID: item.ID,
        level: artifact.level,
        rarity: artifact.rarity,
        mainStatType: artifact.mainStatType,
        subStats: artifact.subStats,
      })
    );

    notification.success({
      content: "Artifact updated successfully!",
    });
    onUpdate?.(item);
  };

  const handleSeeDifferences = (item: IArtifactBasic) => {
    setExpandedId(expandedId === item.ID ? -1 : item.ID);
  };

  const renderSubStat = (subStat?: IArtifactBasic["subStats"][number]) => {
    if (!subStat) {
      return "-";
    }

    return `${t(subStat.type)} - ${subStat.value}${suffixOf(subStat.type)}`;
  };

  return (
    <div>
      <div className="mb-2">
        <p className="text-primary-1 font-semibold">{artifact.data.name}</p>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const different = diffMap.current.get(item.ID) ?? isDifferent(item);

          return (
            <ItemSaveOption
              key={item.ID}
              label={`Artifact ${index + 1}`}
              item={item}
              className="relative"
            >
              {different ? (
                <button
                  className="text-sm underline underline-offset-3 glow-on-hover"
                  onClick={() => handleSeeDifferences(item)}
                >
                  See differences
                </button>
              ) : (
                <p className="text-sm text-light-hint">No differences</p>
              )}

              {expandedId === item.ID && (
                <div className="mt-2">
                  <Table>
                    <Table.Tr>
                      <Table.Th></Table.Th>
                      <Table.Th>This</Table.Th>
                      <Table.Th>To add</Table.Th>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Level</Table.Td>
                      <Table.Td>{item.level}</Table.Td>
                      <Table.Td>{artifact.level}</Table.Td>
                    </Table.Tr>
                    {item.subStats.map((subStat, index) => (
                      <Table.Tr key={index}>
                        <Table.Td className="whitespace-nowrap">Stat {index + 1}</Table.Td>
                        <Table.Td>{renderSubStat(subStat)}</Table.Td>
                        <Table.Td>{renderSubStat(artifact.subStats[index])}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table>
                </div>
              )}

              {different && (
                <Button
                  size="small"
                  className="absolute top-4 right-4"
                  onClick={() => handleUpdate(item)}
                >
                  Update
                </Button>
              )}
            </ItemSaveOption>
          );
        })}
      </div>
    </div>
  );
}
