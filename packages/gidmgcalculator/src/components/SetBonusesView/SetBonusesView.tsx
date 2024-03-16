import type { ArtifactSetBonus } from "@Src/types";
import { $AppData } from "@Src/services";
import { parseArtifactDescription, toArray } from "@Src/utils";

interface SetBonusesViewProps {
  setBonuses: ArtifactSetBonus[];
  noTitle?: boolean;
}
export const SetBonusesView = ({ setBonuses, noTitle }: SetBonusesViewProps) => {
  return (
    <div>
      {!noTitle && <p className="text-lg leading-relaxed text-orange-500 font-semibold">Set bonus</p>}

      {setBonuses.length > 0 ? (
        setBonuses.map((bonus, index) => {
          const content = [];
          const data = $AppData.getArtifactSet(bonus.code);
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
                <span className="text-orange-500">{(i + 1) * 2}-Piece Set:</span>{" "}
                <span dangerouslySetInnerHTML={{ __html: parsedDescription }} />
              </li>
            );
          }
          return (
            <div key={index} className="mt-1">
              <p className="text-lg leading-relaxed font-medium text-green-300">{data.name}</p>
              <ul className="pl-6 list-disc">{content}</ul>
            </div>
          );
        })
      ) : (
        <p className="text-light-800 font-medium">No set bonus</p>
      )}
    </div>
  );
};
