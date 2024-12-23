import { useState } from "react";
import { FaCog } from "react-icons/fa";
import { Button } from "rond";

import { GenshinImage } from "@Src/components";
import { ArtifactManager } from "../hooks/useArtifactManager";

export type ArtifactSetOption = {
  data: {
    code: number;
    name: string;
    icon: string;
  };
  totalCount: number;
  selectedCount: number;
};

interface ArtifactSetSelectProps {
  id: string;
  manager: ArtifactManager;
  onSubmit: (sets: ArtifactSetOption[]) => string | undefined;
}
export function ArtifactSetSelect({ manager }: ArtifactSetSelectProps) {
  const [sets, setSets] = useState(manager.sets);
  const [expandedCode, setExpandedCode] = useState(0);

  return (
    <form>
      {sets.map((set) => {
        const { code } = set.data;

        return (
          <div key={code}>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <GenshinImage className="w-8 h-8" src={set.data.icon} imgType="artifact" />
                <span>{set.data.name}</span>
              </div>

              <div className="ml-auto flex gap-3">
                <p>
                  {set.selected ? <span>{set.selected} / </span> : null}
                  <span>{set.total}</span>
                </p>
                <Button
                  title="Settings"
                  icon={<FaCog />}
                  variant="custom"
                  onClick={() => setExpandedCode(code === expandedCode ? 0 : code)}
                />
              </div>
            </div>
            {/* <div></div> */}
          </div>
        );
      })}
    </form>
  );
}
