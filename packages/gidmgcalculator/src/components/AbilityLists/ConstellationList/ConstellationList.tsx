import { useEffect, useState } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, CarouselSpace, clsx, type ClassValue } from "rond";

import type { Character } from "@/models";

// Conponent
import { AbilityIcon } from "../components/AbilityIcon";
import { ConstellationDetail } from "./ConstellationDetail";

type ConstellationListProps = {
  className?: ClassValue;
  character: Character;
  /** Default true */
  mutable?: boolean;
  onClickIcon?: (index: number) => void;
};

export function ConstellationList(props: ConstellationListProps) {
  const { character, mutable = true } = props;
  const { vision, constellation } = character.data;
  const [detailConsLv, setDetailConsLv] = useState<number | null>(null);
  const [atDetail, setAtDetail] = useState(false);

  useEffect(() => {
    setAtDetail(false);
  }, [character.code]);

  if (!constellation.length) {
    return (
      <p className={clsx("pt-4 px-4 text-xl text-center", props.className)}>
        The time has not yet come for this person's corner of the night sky to light up.
      </p>
    );
  }

  const handleSeeDetail = (consLv: number) => {
    setAtDetail(true);
    setDetailConsLv(consLv);
  };

  return (
    <CarouselSpace
      current={atDetail ? 1 : 0}
      className={props.className}
      onTransitionEnd={() => {
        if (!atDetail) {
          setDetailConsLv(null);
        }
      }}
    >
      <div className="h-full hide-scrollbar flex flex-col space-y-4">
        {constellation.map((cons, i) => {
          const active = character.cons >= i + 1;

          return (
            <div key={i} className="flex items-center">
              <div className="shrink-0 py-1 pr-2 flex-center">
                <AbilityIcon
                  className={mutable && "cursor-pointer"}
                  img={cons.image}
                  active={active}
                  vision={vision}
                  onClick={() => props.onClickIcon?.(i)}
                />
              </div>
              <div className="grow flex group" onClick={() => handleSeeDetail(i + 1)}>
                <p className={clsx("px-2 text-lg font-bold", !active && "opacity-50")}>
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
      {detailConsLv !== null && (
        <ConstellationDetail
          character={character.data}
          consLv={detailConsLv}
          onChangeConsLv={setDetailConsLv}
          onClose={() => setAtDetail(false)}
        />
      )}
    </CarouselSpace>
  );
}
