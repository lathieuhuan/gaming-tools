import { useState } from "react";
import { useElementSize } from "rond";

import type { Artifact } from "@/models/Artifact";
import type { ArtifactGear } from "@/models/ArtifactGear";

import { ArtifactCard, ArtifactCardAction } from "../ArtifactCard";
import { OwnerLabel } from "../OwnerLabel";

type SelectArtifactViewProps = {
  artifact?: Artifact;
  currentAtfGear?: ArtifactGear;
  actions: (
    showingCurrent: boolean,
    setShowingCurrent: (showingCurrent: boolean) => void,
  ) => ArtifactCardAction<Artifact>[];
};

export function SelectArtifactView({ artifact, currentAtfGear, actions }: SelectArtifactViewProps) {
  const [ref, { height }] = useElementSize<HTMLDivElement>();
  const [showingCurrent, setShowingCurrent] = useState(false);

  const currentPiece = artifact?.type ? currentAtfGear?.pieces[artifact.type] : undefined;

  return (
    <div className="h-full flex flex-col relative">
      <div ref={ref} className="grow">
        <ArtifactCard
          wrapperCls="w-72 h-full"
          artifact={artifact}
          withActions={!!artifact}
          actions={actions(showingCurrent, setShowingCurrent)}
        />
      </div>

      {currentAtfGear != undefined && (
        <div
          className={
            "absolute top-0 z-10 h-full hide-scrollbar transition-size duration-200 " +
            (showingCurrent ? "w-60" : "w-0")
          }
          style={{
            height,
            right: "calc(100% - 1rem)",
          }}
        >
          <div className="w-64 pr-2 pb-2 h-full flex flex-col bg-dark-1 rounded-l-lg">
            <ArtifactCard mutable={false} artifact={currentPiece} />

            <p className="mt-4 text-center text-heading">Current equipment</p>
          </div>
        </div>
      )}

      <OwnerLabel className="mt-3" item={artifact} />
    </div>
  );
}
