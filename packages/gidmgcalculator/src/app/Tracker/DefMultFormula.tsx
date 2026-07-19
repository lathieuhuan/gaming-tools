import { HintText, PositiveText } from "@/components/Text";

type DefMultFormulaProps = {
  defIgnore?: number;
  charLv: number;
  targetLv: number;
  totalDefReduct: number;
};

export function DefMultFormula({
  defIgnore,
  charLv,
  targetLv,
  totalDefReduct,
}: DefMultFormulaProps) {
  return (
    <div className="flex items-center">
      <p className="mr-4 text-primary-1">DEF Mult.</p>

      <div className="text-sm flex flex-col items-center">
        <p>
          <HintText>char. Lv.</HintText> <PositiveText>{charLv}</PositiveText> + 100
        </p>

        <div className="my-1 w-full h-px bg-rarity-1" />

        <p className="px-2 text-center">
          {totalDefReduct ? (
            <>
              (1 - <HintText>DEF reduction</HintText> <PositiveText>{totalDefReduct}</PositiveText>{" "}
              / 100) *
            </>
          ) : null}{" "}
          {defIgnore ? (
            <>
              (1 - <HintText>DEF ignore</HintText> <PositiveText>{defIgnore}</PositiveText> / 100) *
            </>
          ) : null}{" "}
          (<HintText>target Lv.</HintText> <PositiveText>{targetLv}</PositiveText> + 100) +{" "}
          <HintText>char. Lv.</HintText> <PositiveText>{charLv}</PositiveText> + 100
        </p>
      </div>
    </div>
  );
}
