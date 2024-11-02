"use client";

import { api } from "@/trpc/react";
import { login } from "../api/auth/login/client";

const loginHandler = async () => {
  const x = await login('hello');

  console.log(x.data?.name, x.data?.id);
}

export function LoginButton() {

  return (
    <div>
      <span>Value:</span>
      <button onClick={loginHandler}>Click</button>
    </div>
  );
}
