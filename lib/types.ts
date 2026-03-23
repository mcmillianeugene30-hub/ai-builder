export interface FrontendConfig {
  framework: string;
  language: string;
  styling: string;
  components: string[];
  features: string[];
}

export interface BackendConfig {
  framework: string;
  language: string;
  apiRoutes: string[];
  features: string[];
}

export interface DatabaseConfig {
  orm: string;
  entities: string[];
  relations: string[];
}

export interface GeneratedApp {
  frontend: FrontendConfig;
  backend: BackendConfig;
  database: DatabaseConfig;
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