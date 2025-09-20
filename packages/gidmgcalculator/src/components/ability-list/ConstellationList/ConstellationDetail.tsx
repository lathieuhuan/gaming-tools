import { CloseButton, LoadingSpin } from "rond";
import { AppCharacter } from "@Calculation";

import { $AppCharacter } from "@/services";
import { useQuery } from "@/hooks";

// Conponent
import { markDim, markGreen } from "../../span";
import { AbilityCarousel } from "../_components/AbilityCarousel";

type ConstellationDetailProps = {
  appCharacter: AppCharacter;
  consLv: number;
  onChangeConsLv?: (newLv: number) => void;
  onClose?: () => void;
};

export function ConstellationDetail({
  appCharacter,
  consLv,
  onChangeConsLv,
  onClose,
}: ConstellationDetailProps) {
  const { vision, constellation } = appCharacter;
  const consInfo = constellation[consLv - 1] || {};

  const {
    isLoading,
    isError,
    data: descriptions,
  } = useQuery([appCharacter.name], () => $AppCharacter.fetchConsDescriptions(appCharacter.name));

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
