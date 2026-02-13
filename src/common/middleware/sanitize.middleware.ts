import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  private dompurify: ReturnType<typeof createDOMPurify>;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const window = new JSDOM('').window as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.dompurify = createDOMPurify(window);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize query parameters in place
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          const value = req.query[key];
          if (typeof value === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            (req.query as any)[key] = this.sanitizeString(value);
          }
        }
      }
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.body = this.sanitizeObject(req.body) as typeof req.body;
    }

    // Sanitize params in place
    if (req.params && typeof req.params === 'object') {
      for (const key in req.params) {
        if (Object.prototype.hasOwnProperty.call(req.params, key)) {
          const value = req.params[key];
          if (typeof value === 'string') {
            req.params[key] = this.sanitizeString(value);
          }
        }
      }
    }

    next();
  }

  private sanitizeString(value: string): string {
    let sanitized = this.dompurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // Remove dangerous patterns
    sanitized = sanitized.replace(/(%27)|(')|(--)|(%23)|(#)/gi, '');
    sanitized = sanitized.replace(/\$\{|\$where|\$ne|\$gt|\$lt/gi, '');

    return sanitized.trim();
  }

  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const sanitizedKey = this.sanitizeString(key);

          if (
            ['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)
          ) {
            continue;
          }

          sanitized[sanitizedKey] = this.sanitizeObject(
            (obj as Record<string, unknown>)[key],
          );
        }
      }
      return sanitized;
    }

    return obj;
  }
}
