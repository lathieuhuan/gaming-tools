import { useEffect, useState } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, CarouselSpace, clsx, type ClassValue } from "rond";

import { $AppCharacter } from "@/services";
import type { Character } from "@/types";

// Conponent
import { AbilityIcon } from "../_components/AbilityIcon";
import { ConstellationDetail } from "./ConstellationDetail";

type ConstellationListProps = {
  className?: ClassValue;
  character: Character;
  /** Default to true */
  mutable?: boolean;
  onClickIcon?: (index: number) => void;
};

export function ConstellationList(props: ConstellationListProps) {
  const { character, mutable = true } = props;
  const [consLv, setConsLv] = useState(0);
  const [atDetail, setAtDetail] = useState(false);

  const appCharacter = $AppCharacter.get(character.name);

  useEffect(() => {
    setAtDetail(false);
  }, [appCharacter.code]);

  if (!appCharacter.constellation.length) {
    return (
      <p className={clsx("pt-4 px-4 text-xl text-center", props.className)}>
        The time has not yet come for this person's corner of the night sky to light up.
      </p>
    );
  }

  const onClickInfo = (level: number) => {
    setAtDetail(true);
    setConsLv(level);
  };

  return (
    <CarouselSpace current={atDetail ? 1 : 0} className={props.className}>
      <div className="h-full hide-scrollbar flex flex-col space-y-4">
        {appCharacter.constellation.map((cons, i) => {
          return (
            <div key={i} className="flex items-center">
              <div className="shrink-0 py-1 pr-2 flex-center">
                <AbilityIcon
                  className={mutable && "cursor-pointer"}
                  img={cons.image}
                  active={character.cons >= i + 1}
                  vision={appCharacter.vision}
                  onClick={() => props.onClickIcon?.(i)}
                />
              </div>
              <div className="grow flex group" onClick={() => onClickInfo(i + 1)}>
                <p
                  className={
                    "px-2 text-lg font-bold" + (character.cons < i + 1 ? " opacity-50" : "")
                  }
                >
                  {cons.name}
                </p>
                <Button
                  className="mt-1 ml-auto group-hover:bg-primary-1 shrink-0"
                  size="small"
                  icon={<FaInfo />}
                />
              </div>
            </div>
          );
        })}
      </div>
      {consLv ? (
        <ConstellationDetail
          appCharacter={appCharacter}
          consLv={consLv}
          onChangeConsLv={setConsLv}
          onClose={() => {
            setAtDetail(false);
            setTimeout(() => setConsLv(0), 200);
          }}
        />
      ) : null}
    </CarouselSpace>
  );
}
