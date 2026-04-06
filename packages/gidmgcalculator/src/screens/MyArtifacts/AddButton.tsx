import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button, message } from "rond";

import { ArtifactForge } from "@/components";
import { MAX_USER_ARTIFACTS } from "@/constants";
import { Artifact } from "@/models";
import { RawArtifact } from "@/types";
import { useDispatch } from "@Store/hooks";
import { addDbArtifact } from "@Store/userdbSlice";

type AddButtonProps = {
  currentArtifactsCount: number;
};

export function AddButton({ currentArtifactsCount }: AddButtonProps) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const isNewArtifactAddable = () => {
    if (currentArtifactsCount < MAX_USER_ARTIFACTS) {
      return true;
    }

    message.error("Number of stored artifacts has reached its limit.");

    return false;
  };

  const handleClickAdd = () => {
    if (isNewArtifactAddable()) {
      setOpen(true);
    }
  };

  const handleForgeArtifact = (artifact: Artifact) => {
    if (isNewArtifactAddable()) {
      // TODO check if we can improve this
      dispatch(addDbArtifact(artifact.serialize()));
    }
  };

  return (
    <>
      <Button icon={<FaPlus />} onClick={handleClickAdd}>
        Add
      </Button>

      <ArtifactForge
        active={open}
        hasConfigStep
        hasMultipleMode
        onForgeArtifact={handleForgeArtifact}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
