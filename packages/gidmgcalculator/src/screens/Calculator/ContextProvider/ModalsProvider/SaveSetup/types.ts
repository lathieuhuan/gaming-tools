type ValidationErrorCode = "EXCESSIVE_SETUP" | "EXCESSIVE_WEAPON" | "EXCESSIVE_ARTIFACT" | "MUTATED_TEAMMATES";

export type ValidationError = {
  code: ValidationErrorCode;
  message: string;
};
