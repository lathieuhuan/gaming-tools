import { markGreen } from "../span";

export const SUPERCONDUCT_DEBUFF_CONFIG = {
  heading: "Superconduct",
  description: (
    <>
      Reduces the {markGreen("Physical RES")} of enemies by {markGreen("40%", "bold")} for 12
      seconds.
    </>
  ),
};

export const SECRET_RITE_BUFF_CONFIG = {
  heading: "Hexerei: Secret Rite",
  description: `With at least 2 Hexerei characters in the party, this effect is granted, which further
  enhances Hexerei characters.`,
};
