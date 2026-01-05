export const CONTINUE_MSG = "Press Continue to save it.";

export const genNewEntityMessage = (entity: string) => {
  return `This is a new ${entity}.`;
};

export const genSameEntityMessage = (entity: string) => {
  return {
    main: `Similar ${entity}s are found. Reuse is recommended.`,
    hint: `You can select 1 ${entity} and update it if different.`,
  };
};

export const getDifferentEntityMessage = (entity: string) => {
  return `The ${entity} to be saved is different from the current ${entity}.`;
};
