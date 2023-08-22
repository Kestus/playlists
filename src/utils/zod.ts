import { TRPCError } from "@trpc/server";
import { log } from "next-axiom";
import { z } from "zod";


export const tryZodParse = <T extends z.AnyZodObject>(response: object, validator: T): z.infer<T> => {
  try {
    return validator.parse(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      log.error(`${JSON.stringify(err.issues, null, 4)}`);
    }
    throw new TRPCError({ code: "PARSE_ERROR" });
  }
}