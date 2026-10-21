import { set, type FieldErrors, type FieldValues, type Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * Minimal zod -> react-hook-form resolver. It keeps the dependency list short
 * and works with zod's `superRefine` issues (including nested paths).
 */
export function zodResolver<TSchema extends z.ZodType>(schema: TSchema): Resolver<z.input<TSchema> & FieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data as z.input<TSchema> & FieldValues, errors: {} };
    }
    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!path || (errors as Record<string, unknown>)[path]) continue;
      set(errors, path, { type: issue.code, message: issue.message });
    }
    return { values: {}, errors: errors as FieldErrors<z.input<TSchema> & FieldValues> };
  };
}
