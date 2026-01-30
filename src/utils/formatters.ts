/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  Customer,
  DraftOrder,
  Fulfillment,
  Location,
  Order,
  PaginatedResponse,
  PriceRule,
  Product,
  ResponseFormat,
  Theme,
  Webhook,
} from '../types/entities.js';
import { CrmApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof CrmApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.total !== undefined) {
    lines.push(`**Total:** ${data.total} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore) {
    lines.push(`**More available:** Yes (cursor: \`${data.nextCursor}\`)`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'products':
      lines.push(formatProductsTable(data.items as Product[]));
      break;
    case 'orders':
      lines.push(formatOrdersTable(data.items as Order[]));
      break;
    case 'customers':
      lines.push(formatCustomersTable(data.items as Customer[]));
      break;
    case 'draftOrders':
      lines.push(formatDraftOrdersTable(data.items as DraftOrder[]));
      break;
    case 'fulfillments':
      lines.push(formatFulfillmentsTable(data.items as Fulfillment[]));
      break;
    case 'locations':
      lines.push(formatLocationsTable(data.items as Location[]));
      break;
    case 'webhooks':
      lines.push(formatWebhooksTable(data.items as Webhook[]));
      break;
    case 'priceRules':
      lines.push(formatPriceRulesTable(data.items as PriceRule[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format products as Markdown table
 */
function formatProductsTable(products: Product[]): string {
  const lines: string[] = [];
  lines.push('| ID | Title | Vendor | Status | Variants |');
  lines.push('|---|---|---|---|---|');

  for (const product of products) {
    const variantCount = product.variants?.length || 0;
    lines.push(
      `| ${product.id} | ${product.title} | ${product.vendor || '-'} | ${product.status || '-'} | ${variantCount} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format orders as Markdown table
 */
function formatOrdersTable(orders: Order[]): string {
  const lines: string[] = [];
  lines.push('| ID | Order # | Customer | Total | Status | Created |');
  lines.push('|---|---|---|---|---|---|');

  for (const order of orders) {
    const customerName = order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() ||
        order.customer.email
      : '-';
    const total = `${order.currency || '$'} ${order.totalPrice || '0'}`;
    lines.push(
      `| ${order.id} | ${order.orderNumber || order.name} | ${customerName} | ${total} | ${order.financialStatus || '-'} | ${order.createdAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format customers as Markdown table
 */
function formatCustomersTable(customers: Customer[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Email | Orders | Total Spent |');
  lines.push('|---|---|---|---|---|');

  for (const customer of customers) {
    const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '-';
    lines.push(
      `| ${customer.id} | ${name} | ${customer.email || '-'} | ${customer.ordersCount || 0} | ${customer.totalSpent || '0'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format draft orders as Markdown table
 */
function formatDraftOrdersTable(draftOrders: DraftOrder[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Customer | Total | Status | Created |');
  lines.push('|---|---|---|---|---|---|');

  for (const draftOrder of draftOrders) {
    const customerName = draftOrder.customer
      ? `${draftOrder.customer.firstName || ''} ${draftOrder.customer.lastName || ''}`.trim() ||
        draftOrder.customer.email
      : '-';
    lines.push(
      `| ${draftOrder.id} | ${draftOrder.name} | ${customerName} | ${draftOrder.totalPrice || '0'} | ${draftOrder.status || '-'} | ${draftOrder.createdAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format fulfillments as Markdown table
 */
function formatFulfillmentsTable(fulfillments: Fulfillment[]): string {
  const lines: string[] = [];
  lines.push('| ID | Order ID | Status | Tracking # | Created |');
  lines.push('|---|---|---|---|---|');

  for (const fulfillment of fulfillments) {
    lines.push(
      `| ${fulfillment.id} | ${fulfillment.orderId || '-'} | ${fulfillment.status || '-'} | ${fulfillment.trackingNumber || '-'} | ${fulfillment.createdAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format locations as Markdown table
 */
function formatLocationsTable(locations: Location[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | City | Country | Active |');
  lines.push('|---|---|---|---|---|');

  for (const location of locations) {
    lines.push(
      `| ${location.id} | ${location.name} | ${location.city || '-'} | ${location.countryCode || '-'} | ${location.active ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format webhooks as Markdown table
 */
function formatWebhooksTable(webhooks: Webhook[]): string {
  const lines: string[] = [];
  lines.push('| ID | Topic | Address | Format |');
  lines.push('|---|---|---|---|');

  for (const webhook of webhooks) {
    lines.push(
      `| ${webhook.id} | ${webhook.topic} | ${webhook.address} | ${webhook.format || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format price rules as Markdown table
 */
function formatPriceRulesTable(priceRules: PriceRule[]): string {
  const lines: string[] = [];
  lines.push('| ID | Title | Target Type | Value | Starts | Ends |');
  lines.push('|---|---|---|---|---|---|');

  for (const rule of priceRules) {
    const value = rule.valueType === 'percentage' ? `${rule.value}%` : `${rule.value}`;
    lines.push(
      `| ${rule.id} | ${rule.title} | ${rule.targetType || '-'} | ${value} | ${rule.startsAt || '-'} | ${rule.endsAt || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format themes as Markdown list
 */
export function formatThemesAsMarkdown(themes: Theme[]): string {
  const lines: string[] = [];
  lines.push('## Themes');
  lines.push('');
  lines.push('| ID | Name | Role | Previewable |');
  lines.push('|---|---|---|---|');

  for (const theme of themes) {
    lines.push(
      `| ${theme.id} | ${theme.name} | ${theme.role} | ${theme.previewable ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  if (entityType === 'themes') {
    return formatThemesAsMarkdown(data as Theme[]);
  }
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
