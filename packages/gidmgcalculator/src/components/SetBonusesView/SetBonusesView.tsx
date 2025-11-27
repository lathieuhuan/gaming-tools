import { IArtifactGearSet } from "@/types";
import Array_ from "@/utils/Array";
import { parseArtifactDesc } from "@/utils/description-parsers";

interface SetBonusesViewProps {
  sets: IArtifactGearSet[];
  noTitle?: boolean;
}
export function SetBonusesView({ sets, noTitle }: SetBonusesViewProps) {
  return (
    <div>
      {!noTitle && <p className="text-lg leading-relaxed text-heading font-semibold">Set bonus</p>}

      {sets.length > 0 ? (
        <div className="space-y-2">
          {sets.map((set, index) => {
            const content = [];
            const { name, descriptions, setBonuses } = set.data;

            for (let i = 0; i <= set.bonusLv; i++) {
              const { description = i } = setBonuses?.[i] || {};
              const parsedDescription = Array_.toArray(description).reduce((acc, index) => {
                if (descriptions[index]) {
                  const parsedText = parseArtifactDesc(descriptions[index]);
                  return `${acc} ${parsedText}`;
                }
                return acc;
              }, "");

              content.push(
                <li key={i}>
                  <span className="font-semibold">{i * 2 + 2}-Piece Set:</span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: parsedDescription }} />
                </li>
              );
            }

            return (
              <div key={index} className="mt-1">
                <p className="text-lg leading-relaxed font-medium text-heading">{name}</p>
                <ul className="pl-6 list-disc space-y-1">{content}</ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-light-hint font-medium">No set bonus</p>
      )}
    </div>
  );
}
