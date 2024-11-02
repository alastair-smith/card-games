import crypto from "crypto";

const TOKEN_LENGTH = 64;
const AUTH_TOKEN_EXPIRY_DAYS = 7;

export const generateRandomToken = async () => {
  return crypto.randomBytes(TOKEN_LENGTH / 2).toString("hex");
};

export const getTokenExpiryDate = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + AUTH_TOKEN_EXPIRY_DAYS);

  return expiryDate.toUTCString();
};
