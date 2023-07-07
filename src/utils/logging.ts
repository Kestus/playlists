import type {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime";
import { log } from "next-axiom";

export const logPrismaKnownError = (err: PrismaClientKnownRequestError) => {
  log.error(
    `ConnectTrack Known Error!\n
    Message: ${err.message}\n
    Code: ${err.code}\n`
  );
};

export const logPrismaUnknownError = (err: PrismaClientUnknownRequestError) => {
  log.error(
    `ConnectTrack Unknown Error!\n
    Message: ${err.message}\n`
  );
};
