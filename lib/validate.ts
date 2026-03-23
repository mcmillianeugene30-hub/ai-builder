import type { GeneratedApp } from './types';

export function validateSchema(raw: string): GeneratedApp | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.frontend === 'object' &&
      typeof parsed.backend === 'object' &&
      typeof parsed.frontend.framework === 'string' &&
      typeof parsed.backend.framework === 'string'
    ) {
      return parsed as GeneratedApp;
    }
    return null;
  } catch {
    return null;
  }
}
