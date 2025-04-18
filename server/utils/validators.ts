import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory to validate requests using Zod schemas
 * @param schema Zod schema to validate the request body against
 */
export function zodValidator(schema: z.ZodType<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        message: "Server error during validation",
      });
    }
  };
}