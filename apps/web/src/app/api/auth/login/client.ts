import {
  type RequestSchema,
  requestSchema,
  type ResponseSchema,
  responseSchema,
  ERROR_PREFIX,
} from "./schema";

/**
 * Create a user if one doesn't already exist, setting a user token cookie.
 *
 * If a user and token already exist then no action is taken.
 * */
export const login = async (name?: string): Promise<ResponseSchema> => {
  let body: RequestSchema;
  let response: unknown;
  let validatedResponse: ResponseSchema;

  try {
    body = requestSchema.parse({ name });
  } catch (error) {
    console.error(error);
    return { error: `${ERROR_PREFIX}Input Validation Error`, data: null };
  }

  try {
    const rawResponse = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    response = await rawResponse.json();
  } catch (error) {
    console.error(error);
    return { error: `${ERROR_PREFIX}Fetching Error`, data: null };
  }

  try {
    validatedResponse = responseSchema.parse(response);
  } catch (error) {
    console.error(error);
    return { error: `${ERROR_PREFIX}Output Validation Error`, data: null };
  }

  return validatedResponse;
};
