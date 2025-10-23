type CharacterLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  character: { name: string; level: string; rarity: number; index: number };
  marker?: React.ReactNode;
  withEmptySlot?: boolean;
};

export const CharacterLabel = ({
  character,
  marker,
  withEmptySlot,
  ...rest
}: CharacterLabelProps) => {
  return (
    <div className="flex flex-col cursor-default select-none" {...rest}>
      <div className="px-2 py-1 h-10 bg-dark-3 rounded-sm" hidden={!withEmptySlot}></div>

      <div className="px-2 py-1 rounded-sm flex items-center hover:bg-dark-2">
        <div className="w-8 h-8 mr-2 flex-center text-light-1 pointer-events-none">{marker}</div>

        <p className="pointer-events-none text-light-1">
          <span className={`text-rarity-${character.rarity}`}>{character.name}</span> (Lv.{" "}
          {character.level})
        </p>
      </div>
    </div>
  );
};
