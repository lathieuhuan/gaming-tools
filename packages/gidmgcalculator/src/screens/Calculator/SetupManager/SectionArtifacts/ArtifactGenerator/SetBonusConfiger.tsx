import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Button } from "rond";

import { ArtifactForge, GenshinImage } from "@/components";
import { Artifact } from "@/models";

export function SetBonusConfiger() {
  const [forge, setForge] = useState({
    active: false,
    slot: 0,
  });
  const [selectedAtfs, setSelectedAtfs] = useState<(Artifact | null)[]>([null, null]);

  const [atf1, atf2] = selectedAtfs;

  const closeForge = () => {
    setForge((prev) => ({ ...prev, active: false }));
  };

  const handleForgeArtifact = (artifact: Artifact) => {
    const newAtfs = selectedAtfs.map((atf, index) => (index === forge.slot ? artifact : atf));

    // Changing first slot will change the whole 4-piece set (the 2nd slot)
    if (forge.slot === 0) {
      newAtfs[1] = artifact;
    }

    setSelectedAtfs(newAtfs);
    closeForge();
  };

  const handleRemoveArtifact = (index: number) => {
    setSelectedAtfs(selectedAtfs.map((atf, slot) => (slot !== index ? atf : null)));
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-light-hint">Set Bonus</p>

      <div className="flex gap-4">
        {selectedAtfs.map((atf, index) => (
          <div key={index} className="relative">
            <button
              className="size-16 bg-dark-2 rounded-circle flex-center glow-on-hover"
              onClick={() => setForge({ active: true, slot: index })}
            >
              {atf ? (
                <GenshinImage
                  className="size-full"
                  title={atf.data.name}
                  src={atf.data.flower.icon}
                  fallbackCls="p-2"
                />
              ) : (
                <FaPlus className="text-2xl" />
              )}
            </button>

            <Button
              className="absolute -bottom-1 -right-1 glow-on-hover"
              size="small"
              hidden={!atf}
              icon={<FaTimes />}
              onClick={() => handleRemoveArtifact(index)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm">
        {atf1 && (
          <p>
            <span className="text-bonus">
              {atf1.data.code === atf2?.data.code ? "4-piece" : "2-piece"}
            </span>
            : {atf1.data.name}
          </p>
        )}
        {atf2 && atf2.data.code !== atf1?.data.code && (
          <p>
            <span className="text-bonus">2-piece</span>: {atf2.data.name}
          </p>
        )}
      </div>

      <ArtifactForge
        active={forge.active}
        forcedType="flower"
        onForgeArtifact={handleForgeArtifact}
        onClose={closeForge}
      />
    </div>
  );
}
