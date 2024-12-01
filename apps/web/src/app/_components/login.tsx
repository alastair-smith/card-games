"use client";

import { toast } from "@/components/ui/toast";
import { login } from "@/app/api/auth/jwt/client";

const loginHandler = async () => {
  const response = await login("hello");

  if (response.error !== null) {
    const errorMessage = `Login Error: ${response.error}`;

    toast.error(errorMessage);
    console.error(errorMessage);
  } else {
    toast.info(response.data.name);
  }
};

export function LoginButton() {
  return <button onClick={loginHandler}>Click</button>;
}
