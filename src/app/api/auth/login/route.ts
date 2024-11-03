import { generateRandomToken, getTokenExpiryDate } from "@/server/auth";
import { db } from "@/server/db";
import type { NextRequest } from "next/server";
import {
  ERROR_PREFIX,
  requestSchema,
  responseSchema,
  type ResponseSchema,
} from "./schema";
import { parse as parseCookies } from "cookie";
import { generatePlayerName } from "@/utils/name-generator";

const TOKEN_COOKIE_NAME = "token";

const sendResponse = ({
  body,
  status,
  headers,
}: {
  body: ResponseSchema;
  status: number;
  headers?: Record<string, string>;
}) => {
  let validatedBody;

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

  return new Response(JSON.stringify(validatedBody), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
};

const getExistingUser = async (req: NextRequest) => {
  const cookies = parseCookies(req.headers.get("cookie") ?? "");
  const token = cookies[TOKEN_COOKIE_NAME];

  if (!token) return null;

  const user = await db.user.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return user;
};

export const POST = async (req: NextRequest) => {
  let body;
  let user;
  let token;

  try {
    const existingUser = await getExistingUser(req);

    if (existingUser) {
      return sendResponse({
        body: {
          error: null,
          data: { id: existingUser.id, name: existingUser.name },
        },
        status: 200,
      });
    }
  } catch (error) {
    console.error(error);

    return sendResponse({
      body: { error: `${ERROR_PREFIX}Internal Server Error`, data: null },
      status: 500,
    });
  }

  try {
    body = requestSchema.parse(await req.json());
  } catch (error) {
    console.error(error);

    return sendResponse({
      body: { error: `${ERROR_PREFIX}Validation Error`, data: null },
      status: 400,
    });
  }

  try {
    token = await generateRandomToken();

    user = await db.user.create({
      data: {
        token,
        name: body.name ?? generatePlayerName(),
      },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    console.error(error);

    return sendResponse({
      body: { error: `${ERROR_PREFIX}Internal Server Error`, data: null },
      status: 500,
    });
  }

  return sendResponse({
    body: { error: null, data: { id: user.id, name: user.name } },
    status: 200,
    headers: {
      "set-cookie": `${TOKEN_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${getTokenExpiryDate()}`,
    },
  });
};
