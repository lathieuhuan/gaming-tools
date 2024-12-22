import { useState } from "react";
import { FaCog } from "react-icons/fa";
import { Button } from "rond";
import { GenshinImage } from "@Src/components";

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
  initialValue: ArtifactSetOption[];
  onSubmit: (sets: ArtifactSetOption[]) => string | undefined;
}
export function ArtifactSetSelect(props: ArtifactSetSelectProps) {
  const [sets, setSets] = useState(props.initialValue);
  const [expandedCode, setExpandedCode] = useState(0);

  return (
    <form >
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
                  {set.selectedCount ? <span>{set.selectedCount} / </span> : null}
                  <span>{set.totalCount}</span>
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
