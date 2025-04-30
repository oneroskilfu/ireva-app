import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { logger } from "../utils/logger";

interface ValidateOptions {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export function validateRequest(options: ValidateOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      if (options.query) {
        req.query = options.query.parse(req.query);
      }

      if (options.params) {
        req.params = options.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        logger.warn(`Validation error: ${JSON.stringify(formattedErrors)}`);
        return res.status(400).json({
          error: "Invalid request data",
          details: formattedErrors,
        });
      }

      logger.error(`Unexpected validation error: ${error.message}`);
      return res.status(500).json({ error: "Internal server error during validation" });
    }
  };
}

/**
 * Simple validation middleware that only validates the request body
 * @param schema The Zod schema to validate the request body against
 */
export function validate(schema: z.ZodType<any>) {
  return validateRequest({ body: schema });
}