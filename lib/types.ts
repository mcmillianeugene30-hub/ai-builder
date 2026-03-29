// New AI-generated app scaffold format
export interface GeneratedApp {
  frontend: {
    framework: string;
    files: Record<string, string>;
  };
  backend: {
    framework: string;
    files: Record<string, string>;
  };
  database?: {
    schema?: string;
    migrations?: string[];
  };
}

export interface GenerationResult {
  data?: GeneratedApp;
  error?: string;
}

// Legacy app scaffold format (used by existing page.tsx and projects.ts)
export interface LegacyGeneratedApp {
  frontend: {
    framework: string;
    language: string;
    styling: string;
    components: string[];
    features: string[];
  };
  backend: {
    framework: string;
    language: string;
    apiRoutes: string[];
    features: string[];
  };
  database: {
    orm: string;
    entities: string[];
    relations: string[];
  };
}

export interface AILogEntry {
  id?: number;
  prompt: string;
  model: string;
  success: boolean;
  attempt: number;
  raw_response: string | null;
  error_message: string | null;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  billing_cycle: 'monthly' | 'annual';
  stripe_customer_id: string;
  stripe_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  files: ProjectFile[];
  created_at?: string;
  updated_at?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AILogStatus = 'success' | 'failed' | 'retry';

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}


export interface GenerationMeta {
  model: string;
  provider: string;
  attempt: number;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
}

export interface PromptTemplateOption {
  id: string;
  name: string;
  category: string;
  prompt: string;
}
