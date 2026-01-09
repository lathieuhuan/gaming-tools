export const CONTINUE_MSG = "Press Continue to save.";

export const genNewEntityMessage = (entity: string) => {
  return `This is a new ${entity}.`;
};

type SameEntityMessageOptions = {
  withoutOwner?: boolean;
};

export const genSameEntityMessage = (entity: string, options: SameEntityMessageOptions = {}) => {
  const withoutOwner = options.withoutOwner ? " without owner" : "";

  return {
    main: `Similar ${entity}s${withoutOwner} are found. Reuse is recommended.`,
    hint: `You can select 1 ${entity} and update it if different.`,
  };
};

export const getDifferentEntityMessage = (entity: string) => {
  return `The ${entity} to be saved is different from the current ${entity}.`;
};
