import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getSession,
  nearExpiry,
} from '~/server/auth';
import type { Middleware } from './types';

export const authMiddleware: Middleware = {
  before: async (context, request) => {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = await getSession(authCookie);

    if (!session || nearExpiry(session.expiry)) {
      const { signedJWT, expiry } = await createAuthToken(session?.userId);

      // needed on request to handle auth for the remainder of this call
      request.cookies.set(AUTH_COOKIE_NAME, signedJWT);

      return {
        ...context,
        authCookie: {
          signedJWT,
          expiry,
        },
      };
    }

    return context;
  },
  after: async (context, _request, response) => {
    if (context.authCookie) {
      response.cookies.set(AUTH_COOKIE_NAME, context.authCookie.signedJWT, {
        expires: context.authCookie.expiry,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    }

    return context;
  },
};
