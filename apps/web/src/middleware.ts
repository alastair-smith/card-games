import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getSession,
  nearExpiry,
} from '~/server/auth';

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await getSession(authCookie);

  if (!session || nearExpiry(session.expiry)) {
    const { signedJWT, expiry } = await createAuthToken(session?.userId);

    // needed on request to handle auth for the remainder of this call
    request.cookies.set(AUTH_COOKIE_NAME, signedJWT);

    const response = NextResponse.next();

    // set in response for future requests
    response.cookies.set(AUTH_COOKIE_NAME, signedJWT, {
      expires: expiry,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return response;
  } else {
    return NextResponse.next();
  }
}
