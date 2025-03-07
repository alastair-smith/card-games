import { env } from "@/env";
import { playerIdSchema, type UserId } from "@/types/entities";
import { randomUUID } from "crypto";
import { sign, verify } from 'jsonwebtoken'
import { z } from "zod";

const AUTH_TOKEN_EXPIRY_DAYS = 7;
const RENEW_TOKEN_EXPIRY_DAYS = 6;
export const AUTH_COOKIE_NAME = 'auth';

const jwtSchema = z.object({
  id: playerIdSchema,
  exp: z.number().int().positive()
});

type JWT = z.infer<typeof jwtSchema>;

const generateUserId = (): UserId => {
  return randomUUID()
};

const generateExpiry = (): JWT['exp'] => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + AUTH_TOKEN_EXPIRY_DAYS);

  return expiryDate.getTime();
};

const encodeJWT = (userId?: UserId) => {
  const expiry = generateExpiry();
  const id = userId ?? generateUserId();

  const rawJWT: JWT = { id, exp: expiry };
  const jwt = jwtSchema.parse(rawJWT);
  const signedJWT = sign(jwt, env.AUTH_SECRET)

  return { signedJWT, expiry };
};

const decodeJWT = (unverifiedToken?: string): JWT | null => {
  if (!unverifiedToken) return null;

  try {
    const json = verify(unverifiedToken, env.AUTH_SECRET);
    const parsedJson = jwtSchema.parse(json);

    return parsedJson;
  } catch {
    return null
  }
};

const setAuthCookie = (userId?: UserId) => {
  const { signedJWT, expiry } = encodeJWT(userId);

  return {
    "set-cookie": `${AUTH_COOKIE_NAME}=${signedJWT}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiry}`
  };
};

const nearExpiry = (jwt: JWT): boolean => {
  const timeUntilExpiry = jwt.exp - Date.now();
  const renewCutoff = RENEW_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return timeUntilExpiry < renewCutoff;
};

export const signIn = (callbackUrl: string, authToken: string | undefined): { headers: Record<string, string> } => {
  const validJwt = decodeJWT(authToken);

  const additionalHeaders = !validJwt || nearExpiry(validJwt)
    ? setAuthCookie(validJwt?.id)
    : {};

  return { headers: { location: callbackUrl, ...additionalHeaders } };
}