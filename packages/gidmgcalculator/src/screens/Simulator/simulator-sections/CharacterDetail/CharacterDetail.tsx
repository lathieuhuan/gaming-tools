import { TotalAttribute } from "@Backend";
import { AttributeTable } from "@Src/components";

interface CharacterDetailProps {
  totalAttr: TotalAttribute;
}
export function CharacterDetail(props: CharacterDetailProps) {
  return (
    <div>
      <AttributeTable attributes={props.totalAttr} />
    </div>
  );
}
