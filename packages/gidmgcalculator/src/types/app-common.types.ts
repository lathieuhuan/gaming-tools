export type InputCheck = {
  value: number;
  /**
   * When number, it's the input's index .
   * [various_vision] only on Ballad of the Fjords.
   * Default to 0
   */
  source?: number | "BOL" | "various_vision";
  /** Default to 'equal' */
  type?: "equal" | "min" | "max";
};
