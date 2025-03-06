import { env } from "@/env";
import { playerIdSchema } from "@/types/entities";
import crypto, { randomUUID, type UUID } from "crypto";
import jwt from 'jsonwebtoken'
import { z } from "zod";

const TOKEN_LENGTH = 64;
const AUTH_TOKEN_EXPIRY_DAYS = 7;
export const RENEW_TOKEN_EXPIRY_DAYS = 6;
export const TOKEN_COOKIE_NAME = "auth-token";

/**
 * JOIN GAME AUTH FLOW
 * 
 * 1. User goes to join game url
 * 2. If no player ID or playerID or token expires soon then redirect to login api with callback to game url
 * 2. ID is generated and stored in JWT and sent to client in cookie, no server storage
 */

export const generateRandomToken = async () => {
  return crypto.randomBytes(TOKEN_LENGTH / 2).toString("hex");
};

const getTokenExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + AUTH_TOKEN_EXPIRY_DAYS);

  return expiryDate.toUTCString();
};

const jsonSchema = z.object({
  id: playerIdSchema,
  exp: z.number().int().positive()
});

const generateId = () => {
  return randomUUID()
}

const encodeJWT = (id: UUID) => {
  const rawJson: z.infer<typeof jsonSchema> = { id, exp: Date.now() + AUTH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000 };
  const json = jsonSchema.parse(rawJson);
  const token = jwt.sign(json, env.AUTH_SECRET)

  return { id, token };
};

export const decodeJWT = (unverifiedToken?: string) => {
  if (!unverifiedToken) return null;

  try {
    const json = jwt.verify(unverifiedToken, env.AUTH_SECRET);
    const parsedJson = jsonSchema.parse(json);

    return parsedJson;
  } catch {
    return null
  }
};

export const setAuthCookieHeader = (id?: UUID | null) => {
  const { token } = encodeJWT(id ?? generateId());

  return {
    "set-cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${getTokenExpiryDate()}`
  };
};

export const signIn = (callbackUrl: string, authCookie: string | undefined): { headers: Record<string, string>}  => {
  const validJwt = existingJWT ? decodeJWT(existingJWT) : null;
  
  return {
    headers: {}
  };
}