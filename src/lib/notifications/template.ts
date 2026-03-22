/**
 * Render a template string with {{variable}} placeholders.
 */
export function renderTemplate(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] || '');
}
