import { useState } from "react";
import { MdEdit } from "react-icons/md";
import { Button } from "rond";

import { ArtifactForge } from "@/components";
import { Artifact } from "@/models/base";
import { useDispatch } from "@Store/hooks";
import { updateUserArtifact } from "@Store/userdb-slice";

type ReforgeButtonProps = {
  artifact?: Artifact;
};

export function ReforgeButton({ artifact }: ReforgeButtonProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const maxRarity = artifact?.data?.variants.at(-1);

  const handleForgeArtifact = (artifact: Artifact) => {
    dispatch(
      updateUserArtifact({
        ...artifact,
        ID: artifact.ID,
      })
    );
  };

  return (
    <>
      <Button
        className="shrink-0"
        title="Reforge"
        icon={<MdEdit className="text-lg text-black opacity-80" />}
        boneOnly
        onClick={() => setOpen(true)}
      />

      <ArtifactForge
        active={open}
        workpiece={artifact}
        initialMaxRarity={maxRarity}
        hasConfigStep
        hasMultipleMode={false}
        onForgeArtifact={handleForgeArtifact}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
