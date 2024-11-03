export type CalcItemType = "attack" | "healing" | "shield" | "other";

type EntityBonusBasedOnField = "base_atk" | "hp" | "atk" | "def" | "em" | "er_" | "healB_";

export type EntityBonusBasedOn =
  | EntityBonusBasedOnField
  | {
      field: EntityBonusBasedOnField;
      /** actual stat = total stat - baseline */
      baseline?: number;
      /**
       * When this bonus is from teammate, this is input's index to get value.
       * On characters. Default to 0
       */
      alterIndex?: number;
    };
