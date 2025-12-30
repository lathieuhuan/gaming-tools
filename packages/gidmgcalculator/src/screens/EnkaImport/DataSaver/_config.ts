export const LETS_CONTINUE_MSG = "Let's continue to the next step.";

export const genNewEntityMessage = (entity: string) => {
  return `This is a new ${entity}.`;
};

export const genSimilarEntityMessage = (entity: string, noOwner = false) => {
  const owner = noOwner ? "without owner " : "";
  return `Similar saved ${entity}s ${owner}are found. Reuse is recommended.`;
};

export const getDifferentEntityMessage = (entity: string) => {
  return `The ${entity} to be saved is different from the current ${entity}.`;
};
