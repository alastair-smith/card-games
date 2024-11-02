import { generateRandomToken, getTokenExpiryDate } from "@/server/auth";
import { db } from "@/server/db";
import type { NextRequest } from "next/server";
import { requestSchema, responseSchema, type ResponseSchema } from "./schema";

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
      JSON.stringify({ error: "Internal Server Error", data: null }),
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

export const POST = async (req: NextRequest) => {
  let body;
  let user;
  let token;

  try {
    body = requestSchema.parse(await req.json());
  } catch (error) {
    console.error(error);

    return sendResponse({
      body: { error: "Validation Error", data: null },
      status: 400,
    });
  }

  try {
    token = await generateRandomToken();

    user = await db.user.create({
      data: {
        token,
        name: body.name,
      },
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    console.error(error);

    return sendResponse({
      body: { error: "Internal Server Error", data: null },
      status: 500,
    });
  }

  return sendResponse({
    body: { error: null, data: { id: user.id, name: user.name } },
    status: 200,
    headers: {
      "set-cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${getTokenExpiryDate()}`,
    },
  });
};
