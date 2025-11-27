import { CloseButton, LoadingSpin } from "rond";

import type { AppCharacter } from "@/types";
import { useQuery } from "@/hooks";
import { $AppCharacter } from "@/services";

// Conponent
import { markDim, markGreen } from "../../span";
import { AbilityCarousel } from "../_components/AbilityCarousel";

type ConstellationDetailProps = {
  character: AppCharacter;
  consLv: number;
  onChangeConsLv?: (newLv: number) => void;
  onClose?: () => void;
};

export function ConstellationDetail({
  character,
  consLv,
  onChangeConsLv,
  onClose,
}: ConstellationDetailProps) {
  const { vision, constellation } = character;
  const consInfo = constellation[consLv - 1] || {};

  const {
    isLoading,
    isError,
    data: descriptions,
  } = useQuery([character.name], () => $AppCharacter.fetchConsDescriptions(character.name));

  return (
    <div className="h-full flex flex-col hide-scrollbar">
      <AbilityCarousel
        className="pt-2 pb-4"
        currentIndex={consLv - 1}
        images={constellation.map((cons) => cons.image)}
        vision={vision}
        onClickBack={() => onChangeConsLv?.(consLv - 1)}
        onClickNext={() => onChangeConsLv?.(consLv + 1)}
      />
      <p className={`text-xl text-${vision} font-bold`}>{consInfo.name}</p>
      <p className="text-sm">Constellation Lv. {markGreen(consLv, "bold")}</p>
      <div className="mt-3 hide-scrollbar">
        <p className={isLoading ? "py-4 flex justify-center" : "whitespace-pre-wrap"}>
          <LoadingSpin active={isLoading} />
          {isError && markDim("Error. Rebooting...")}
          {descriptions?.[consLv - 1]}
        </p>
      </div>

      <div className="mt-3">
        <CloseButton className="mx-auto" size="small" onClick={onClose} />
      </div>
    </div>
  );
}
