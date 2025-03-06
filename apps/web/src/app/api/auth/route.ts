import { decodeJWT, setAuthCookieHeader, TOKEN_COOKIE_NAME } from "@/server/service/auth";
import type { NextRequest } from "next/server";
import { authBodySchema } from "./schema";
import { logger } from "@/utils/logger";
import { signIn } from "@/server/service/auth";

const TEMPORARY_REDIRECT_STATUS_CODE = 307;

export const POST = async (req: NextRequest) => {
  const body = authBodySchema.safeParse(req.body);

  if (body.error) {
    logger.warn(new Error('Invalid request body', { cause: body.error }));

    return new Response('Missing callbackUrl', { status: 400 });
  }

  const callback = body.data.callbackUrl;
  const authToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  const { headers } = signIn(callback, authToken);

  return new Response(`Redirecting to <a href="${callback}">${callback}</a>.`, {
    status: TEMPORARY_REDIRECT_STATUS_CODE,
    headers,
  })
};
