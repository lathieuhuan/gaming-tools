export const CONTINUE_MSG = "Press Continue to save.";

export const genNewEntityText = (entity: string, hasNoSameEntities = true) => {
  const part1 = `This is a new ${entity}. `;

  return {
    message: (
      <span>
        {hasNoSameEntities && part1}Select <b>Add new</b> to save.
      </span>
    ),
  };
};

export const getDifferentEntityMessage = (entity: string) => {
  return `The ${entity} to be saved is different from the current ${entity}.`;
};

type GenCaseConfigsOptions = {
  hasNoSameEntities?: boolean;
  withoutOwner?: boolean;
};

export const genCaseConfigs = (entity: string, options: GenCaseConfigsOptions = {}) => {
  return {
    toSaveCase: genNewEntityText(entity, options.hasNoSameEntities),
    sameCase: {
      message: (
        <span>
          Similar {entity}s{options.withoutOwner && " without owner"} are found. Reuse is
          recommended.
        </span>
      ),
      hint: `Select 1 to equip (and update) it.`,
    },
  };
};
