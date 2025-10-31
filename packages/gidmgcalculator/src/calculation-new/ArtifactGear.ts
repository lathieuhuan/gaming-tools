import { CORE_STAT_TYPES } from "@/calculation/constants";
import { ArtifactSetBonus } from "@/calculation/utils";
import { applyPercent } from "@/utils/pure-utils";
import TypeCounter from "@/utils/TypeCounter";
import { ArtifactC } from "./Artifact";
import { AttributeControl } from "./AttributeControl";

export class ArtifactGear {
  setBonuses: ArtifactSetBonus[] = [];
  attributes: AttributeControl;

  constructor(public pieces: ArtifactC[] = []) {
    const setBonuses: ArtifactSetBonus[] = [];
    const attributes = new AttributeControl();
    const counter = new TypeCounter();

    for (const artifact of pieces) {
      const codeCount = counter.add(artifact.code);

      if (codeCount === 2) {
        setBonuses.push({ code: artifact.code, bonusLv: 0 });
      } else if (codeCount === 4) {
        setBonuses[0].bonusLv = 1;
      }

      attributes.add(artifact.mainStatType, artifact.mainStatValue);

      artifact.subStats.forEach((subStat) => {
        attributes.add(subStat.type, subStat.value);
      });
    }

    this.setBonuses = setBonuses;
    this.attributes = attributes;
  }

  finalizeAttributes = (baseStats: { hp_base: number; atk_base: number; def_base: number }) => {
    const result = this.attributes.result;

    for (const statType of CORE_STAT_TYPES) {
      const percentStatValue = this.attributes.get(`${statType}_`);

      if (percentStatValue) {
        result[statType] += applyPercent(baseStats[`${statType}_base`], percentStatValue);
      }

      delete result[`${statType}_`];
    }

    return new AttributeControl(result);
  };
}
