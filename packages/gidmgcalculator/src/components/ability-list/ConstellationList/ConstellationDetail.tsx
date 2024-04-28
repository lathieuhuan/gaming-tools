import { AppCharacter } from "@Backend";

import { $AppCharacter } from "@Src/services";
import { useQuery } from "@Src/hooks";
import { CloseButton, LoadingSpin } from "rond";

// Conponent
import { Green, Dim } from "../../span";
import { AbilityCarousel } from "../ability-list-components";

interface ConstellationDetailProps {
  appChar: AppCharacter;
  consLv: number;
  onChangeConsLv?: (newLv: number) => void;
  onClose?: () => void;
}
export function ConstellationDetail({ appChar, consLv, onChangeConsLv, onClose }: ConstellationDetailProps) {
  const { vision, constellation } = appChar;
  const consInfo = constellation[consLv - 1] || {};

  const {
    isLoading,
    isError,
    data: descriptions,
  } = useQuery(appChar.name, () => $AppCharacter.fetchConsDescriptions(appChar.name));

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
      <p className="text-sm">
        Constellation Lv. <Green b>{consLv}</Green>
      </p>
      <div className="mt-3 hide-scrollbar">
        <p className={isLoading ? "py-4 flex justify-center" : "whitespace-pre-wrap"}>
          <LoadingSpin active={isLoading} />
          {isError && <Dim>Error. Rebooting...</Dim>}
          {descriptions?.[consLv - 1]}
        </p>
      </div>

      <div className="mt-3">
        <CloseButton className="mx-auto" size="small" onClick={onClose} />
      </div>
    </div>
  );
}
