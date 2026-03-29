export interface PromptTemplate {
  id: string;
  name: string;
  category: 'saas' | 'marketplace' | 'productivity' | 'developer-tools' | 'commerce';
  prompt: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'saas-crm',
    name: 'B2B CRM SaaS',
    category: 'saas',
    prompt:
      'Build a B2B CRM SaaS with organizations, contacts, deals, stages, activity timeline, role-based access, and email reminders.',
  },
  {
    id: 'marketplace-services',
    name: 'Services Marketplace',
    category: 'marketplace',
    prompt:
      'Create a services marketplace with provider profiles, service listings, search filters, booking requests, chat, and reviews.',
  },
  {
    id: 'kanban-productivity',
    name: 'Team Kanban Workspace',
    category: 'productivity',
    prompt:
      'Generate a kanban productivity app with workspaces, boards, lists, cards, assignees, due dates, labels, and notifications.',
  },
  {
    id: 'api-monitor',
    name: 'API Monitoring Dashboard',
    category: 'developer-tools',
    prompt:
      'Build an API monitoring dashboard with endpoint checks, uptime tracking, incident timeline, alert channels, and team permissions.',
  },
  {
    id: 'commerce-subscriptions',
    name: 'Subscription Commerce',
    category: 'commerce',
    prompt:
      'Create a subscription commerce app with products, plans, checkout, billing history, coupon support, and customer portal management.',
  },
];
