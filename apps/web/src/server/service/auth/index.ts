// This file is imported in middleware, so use edge-friendly packages only!
import { env } from "@/env";
import { SignJWT, jwtVerify } from 'jose'

export const AUTH_COOKIE_NAME = 'auth';
const AUTH_TOKEN_EXPIRY_DAYS = 7;
const RENEW_TOKEN_EXPIRY_DAYS = 6;
const JWT_ISSUER = 'todo-replace';
const JWT_AUDIENCE = 'card-games-web';
const JWT_ALGORITHM = 'HS256';

const secret = new TextEncoder().encode(env.AUTH_SECRET);

const generateUserId = () => {
  return globalThis.crypto.randomUUID();
};

export const createAuthToken = async (userId?: string) => {
  const subject = userId ?? generateUserId();
  const expiry = Date.now() + AUTH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const signedJWT = await (new SignJWT()
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(subject)
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${AUTH_TOKEN_EXPIRY_DAYS}d`)
    .sign(secret));

  return { signedJWT, userId: subject, expiry };
};

export const getSession = async (authToken?: string): Promise<{ userId: string, expiry: number } | null> => {
  if (!authToken) return null;

  try {
    const jwt = await jwtVerify(authToken, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: [JWT_ALGORITHM]
    });

    return jwt.payload.sub && jwt.payload.exp ? { userId: jwt.payload.sub, expiry: jwt.payload.exp } : null
  } catch {
    return null
  }
};

export const nearExpiry = (expiry: number): boolean => {
  const timeUntilExpiry = expiry - Date.now();
  const renewCutoff = RENEW_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return timeUntilExpiry < renewCutoff;
};
