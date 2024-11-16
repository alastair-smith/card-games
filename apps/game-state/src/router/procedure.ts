import { z, ZodSchema } from 'zod';

type Middleware<TInput = unknown> = (input: TInput) => TInput;

type Procedure<TInput = unknown> = {
  use: (middleware: Middleware<TInput>) => Procedure<TInput>;
  input: <T extends ZodSchema>(schema: T) => Procedure<z.infer<T>>;
  handle: (handler: (opts: TInput) => void | Promise<void>) => Procedure<TInput>;
  execute: (data: TInput) => Promise<void>;
};

interface ProcedureNamespace {
  [key: string]: Procedure<any> | ProcedureNamespace;
}

export const procedure = <TInput = unknown>(
  state: {
    middlewares: Middleware<TInput>[];
    inputSchema?: ZodSchema<TInput>;
    handlerFunction?: (opts: TInput) => void | Promise<void>;
  } = { middlewares: [] }
): Procedure<TInput> => {
  return {
    use: (middleware) => {
      return procedure({
        ...state,
        middlewares: [...state.middlewares, middleware],
      });
    },
    input: <T extends ZodSchema>(schema: T) => {
      return procedure<z.infer<T>>({
        ...state,
        inputSchema: schema,
      });
    },
    handle: (handler) => {
      return procedure({
        ...state,
        handlerFunction: handler,
      });
    },
    execute: async (data) => {
      if (!state.inputSchema || !state.handlerFunction) {
        throw new Error(`Procedure must have both input schema and handler defined before execution.`);
      }

      console.log(`[Procedure] Executing with data:`, data);

      // Apply middleware
      let transformedData = data;
      for (const middleware of state.middlewares) {
        transformedData = middleware(transformedData);
      }

      // Validate against the input schema
      const parsedData = state.inputSchema.parse(transformedData);

      // Execute the handler (supports both sync and async)
      await state.handlerFunction(parsedData);
    },
  };
};

export const flattenRoutes = (namespace: ProcedureNamespace, prefix = ''): Record<string, Procedure<any>> => {
  const flatRoutes: Record<string, Procedure<any>> = {};

  for (const [key, value] of Object.entries(namespace)) {
    const routePath = prefix ? `${prefix}.${key}` : key;

    if (typeof value.execute === 'function') {
      flatRoutes[routePath] = value as Procedure<any>;
    } else {
      Object.assign(flatRoutes, flattenRoutes(value as ProcedureNamespace, routePath));
    }
  }

  return flatRoutes;
};
