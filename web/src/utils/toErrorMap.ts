import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {}; //store the field names as keys and the error messages as values.
  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
