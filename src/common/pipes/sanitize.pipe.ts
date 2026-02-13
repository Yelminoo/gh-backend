import { PipeTransform, Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private dompurify: ReturnType<typeof createDOMPurify>;

  constructor() {
    const dom = new JSDOM('');
    const window = dom.window;
    this.dompurify = createDOMPurify(window);
  }

  transform(value: unknown): unknown {
    if (!value) return value;

    // Sanitize strings
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    // Sanitize objects recursively
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeString(value: string): string {
    // Remove potential XSS vectors
    let sanitized = this.dompurify.sanitize(value, {
      ALLOWED_TAGS: [], // Strip all HTML tags
      ALLOWED_ATTR: [], // Strip all attributes
      KEEP_CONTENT: true, // Keep text content
    });

    // Remove SQL injection patterns
    sanitized = sanitized.replace(/(%27)|(')|(--)|(%23)|(#)/gi, '');

    // Remove NoSQL injection patterns
    sanitized = sanitized.replace(/\$\{|\$where|\$ne|\$gt|\$lt/gi, '');

    return sanitized.trim();
  }

  private sanitizeObject(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item: unknown) => this.transform(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize the key itself to prevent prototype pollution
        const sanitizedKey = this.sanitizeString(key);

        // Skip dangerous keys
        if (['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)) {
          continue;
        }

        sanitized[sanitizedKey] = this.transform(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return sanitized;
  }
}
