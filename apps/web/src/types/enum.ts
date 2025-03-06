import { z } from "zod";

export const createEnumFromObject = <T extends Record<string, string>>(
  obj: T,
) => z.enum(Object.values(obj) as [T[keyof T], ...T[keyof T][]]);
