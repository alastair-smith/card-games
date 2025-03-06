import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { logger } from "@/utils/logger";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext(req.headers);
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({path, error, type}) => {
      const errorStatus = getHTTPStatusCodeFromError(error);

      const logType = errorStatus >= 400 && errorStatus < 500 ? "warn" : "error";

      logger[logType](new Error(`TRPC error - ${path} - ${type}`, { cause: error }));
    }
  });

export { handler as GET, handler as POST };
