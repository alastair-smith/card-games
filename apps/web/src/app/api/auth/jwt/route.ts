import { decodeJWT, setAuthCookieHeader, TOKEN_COOKIE_NAME } from "@/server/auth";
import type { NextRequest } from "next/server";
import {
  ERROR_PREFIX,
  callbackSchema,
  responseSchema,
  type ResponseSchema,
} from "./schema";

const sendResponse = ({
  body,
  status,
  headers,
}: {
  body: ResponseSchema;
  status: number;
  headers?: Record<string, string>;
}) => {
  let validatedBody: ResponseSchema;

  try {
    validatedBody = responseSchema.parse(body);
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: `${ERROR_PREFIX}Internal Server Error`,
        data: null,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(typeof validatedBody === 'string' ? validatedBody : JSON.stringify(validatedBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

export const GET = async (req: NextRequest) => {
  const {data: callbackUrl} = callbackSchema.safeParse(req.nextUrl.searchParams.get("callback"));

  if(!callbackUrl) {
     return sendResponse({
      body: { error: `${ERROR_PREFIX}Validation Error`, data: null },
      status: 400,
    })
  }

  const jwt = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const validJwt = jwt ? decodeJWT(jwt) : null;


  return sendResponse({
    body: `Redirect to <a href="${callbackUrl}">${callbackUrl}></a>`,
    status: 307,
    headers: {...setAuthCookieHeader(validJwt?.id), location: callbackUrl},
  });
};
