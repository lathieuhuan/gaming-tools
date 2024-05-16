import { ArtifactSetBonus } from "@Backend";

import { $AppArtifact } from "@Src/services";
import { parseArtifactDescription, toArray } from "@Src/utils";

interface SetBonusesViewProps {
  setBonuses: ArtifactSetBonus[];
  noTitle?: boolean;
}
export function SetBonusesView({ setBonuses, noTitle }: SetBonusesViewProps) {
  return (
    <div>
      {!noTitle && <p className="text-lg leading-relaxed text-heading-color font-semibold">Set bonus</p>}

      {setBonuses.length > 0 ? (
        setBonuses.map((bonus, index) => {
          const content = [];
          const data = $AppArtifact.getSet(bonus.code);
          if (!data) return;
          const { descriptions } = data;

          for (let i = 0; i <= bonus.bonusLv; i++) {
            const { description = i } = data.setBonuses?.[i] || {};
            const parsedDescription = toArray(description).reduce((acc, index) => {
              if (descriptions[index]) {
                const parsedText = parseArtifactDescription(descriptions[index]);
                return `${acc} ${parsedText}`;
              }
              return acc;
            }, "");

            content.push(
              <li key={i} className="mt-1">
                <span className="text-heading-color">{(i + 1) * 2}-Piece Set:</span>{" "}
                <span dangerouslySetInnerHTML={{ __html: parsedDescription }} />
              </li>
            );
          }
          return (
            <div key={index} className="mt-1">
              <p className="text-lg leading-relaxed font-medium text-bonus-color">{data.name}</p>
              <ul className="pl-6 list-disc">{content}</ul>
            </div>
          );
        })
      ) : (
        <p className="text-hint-color font-medium">No set bonus</p>
      )}
    </div>
  );
}
