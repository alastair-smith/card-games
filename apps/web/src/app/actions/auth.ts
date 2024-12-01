'use server';

import { decodeJWT, TOKEN_COOKIE_NAME } from "@/server/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const auth = async (callbackUrl: string) => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  const jwt = decodeJWT(authToken);

  if (!jwt) {
    return redirect(`/api/auth/jwt?callback=${callbackUrl}`);
  } 

  return {
    id: jwt.id,
  };
}