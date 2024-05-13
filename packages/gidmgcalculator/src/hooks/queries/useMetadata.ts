import { useEffect, useState } from "react";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@Src/services";

const MIN_VERSION = "3.8.0";

interface UseMetadataOptions {
  onSuccess?: () => void;
  onError?: () => void;
}
export function useMetadata(options: UseMetadataOptions = {}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const getMetadata = async (isForcedRefetch?: boolean) => {
    if (status !== "loading") {
      setStatus("loading");
    }

    const isOk = await $AppData.fetchMetadata((data) => {
      $AppCharacter.populate(data.characters);
      $AppWeapon.populate(data.weapons);
      $AppArtifact.populate(data.artifacts);
    }, isForcedRefetch);

    if (isOk) {
      setStatus("success");
      options.onSuccess?.();
    } else {
      setStatus("error");
      options.onError?.();
    }
  };

  useEffect(() => {
    getMetadata();
  }, []);

  return {
    status,
    refetch: getMetadata,
  };
}
