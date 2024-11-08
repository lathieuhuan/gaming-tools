import { ArtifactSetBonus } from "@Backend";

import { $AppArtifact } from "@Src/services";
import Array_ from "@Src/utils/array-utils";
import { parseArtifactDescription } from "@Src/utils/description-parsers";

interface SetBonusesViewProps {
  setBonuses: ArtifactSetBonus[];
  noTitle?: boolean;
}
export function SetBonusesView({ setBonuses, noTitle }: SetBonusesViewProps) {
  return (
    <div>
      {!noTitle && <p className="text-lg leading-relaxed text-heading-color font-semibold">Set bonus</p>}

      {setBonuses.length > 0 ? (
        <div className="space-y-2">
          {setBonuses.map((bonus, index) => {
            const content = [];
            const data = $AppArtifact.getSet(bonus.code);
            if (!data) return;
            const { descriptions } = data;

            for (let i = 0; i <= bonus.bonusLv; i++) {
              const { description = i } = data.setBonuses?.[i] || {};
              const parsedDescription = Array_.toArray(description).reduce((acc, index) => {
                if (descriptions[index]) {
                  const parsedText = parseArtifactDescription(descriptions[index]);
                  return `${acc} ${parsedText}`;
                }
                return acc;
              }, "");

              content.push(
                <li key={i}>
                  <span className="font-semibold">{(i + 1) * 2}-Piece Set:</span>{" "}
                  <span dangerouslySetInnerHTML={{ __html: parsedDescription }} />
                </li>
              );
            }
            return (
              <div key={index} className="mt-1">
                <p className="text-lg leading-relaxed font-medium text-heading-color">{data.name}</p>
                <ul className="pl-6 list-disc space-y-1">{content}</ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-hint-color font-medium">No set bonus</p>
      )}
    </div>
  );
}
