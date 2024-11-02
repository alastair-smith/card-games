import { requestSchema, ResponseSchema, responseSchema } from "./schema";

export const login = async (name: string): Promise<ResponseSchema> => {
  let body;
  let response;
  let validatedResponse;

  try {
    body = requestSchema.parse({ name });
  } catch (error) {
    return { error: "Input Validation Error", data: null };
  }

  try {
    const rawResponse = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    response = await rawResponse.json();
  } catch (error) {
    return { error: "Fetching Error", data: null };
  }

  try {
    validatedResponse = responseSchema.parse(response);
  } catch (error) {
    return { error: "Output Validation Error", data: null };
  }

  return validatedResponse;
};
