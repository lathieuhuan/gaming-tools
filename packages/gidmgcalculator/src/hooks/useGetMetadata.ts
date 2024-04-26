import { useEffect, useState } from "react";
import { $AppCharacter, $AppData } from "@Src/services";

interface UseGetMetadataOptions {
  onSuccess?: () => void;
  onError?: () => void;
}
export function useGetMetadata(options: UseGetMetadataOptions = {}) {
  const [status, setStatus] = useState<"done" | "loading" | "error" | "idle">("loading");

  const getMetadata = async (isForcedRefetch?: boolean) => {
    if (status !== "loading") {
      setStatus("loading");
    }

    const isOk = await $AppData.fetchMetadata(
      (data) => $AppCharacter.populateCharacters(data.characters),
      isForcedRefetch
    );

    if (isOk) {
      setStatus("done");
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
    getMetadata,
  };
}
