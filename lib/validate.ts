import type { GeneratedApp } from './types';

export function validateSchema(raw: string): GeneratedApp | null {
  try {
    const parsed = JSON.parse(raw);

    const requiredKeys = ['frontend', 'backend', 'database'];
    const hasAllKeys = requiredKeys.every((key) => key in parsed);

    if (!hasAllKeys) {
      console.error('Missing required top-level keys:', {
        has: Object.keys(parsed),
        required: requiredKeys,
      });
      return null;
    }

    // Validate structure
    if (typeof parsed.project_name !== 'string' || !parsed.project_name) {
      console.error('Invalid or missing project_name');
      return null;
    }

    if (typeof parsed.frontend !== 'object' || !parsed.frontend) {
      console.error('Invalid or missing frontend object');
      return null;
    }

    if (typeof parsed.backend !== 'object' || !parsed.backend) {
      console.error('Invalid or missing backend object');
      return null;
    }

    if (typeof parsed.database !== 'object' || !parsed.database) {
      console.error('Invalid or missing database object');
      return null;
    }

    return parsed as GeneratedApp;
  } catch (err) {
    console.error('JSON parse error:', err);
    return null;
  }
}
