/**
 * Webhook Tools
 *
 * MCP tools for webhook management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register webhook-related tools
 */
export function registerWebhookTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Webhooks
  // ===========================================================================
  server.tool(
    'shopify_list_webhooks',
    `List webhooks with pagination and filters.

Webhooks send notifications to your app when events occur in the store.

Args:
  - limit: Number of webhooks to return (1-250, default: 50)
  - sinceId: Return webhooks after this ID
  - topic: Filter by topic (e.g., orders/create)
  - address: Filter by endpoint URL
  - format: Response format

Returns:
  Paginated list of webhooks.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      topic: z.string().optional(),
      address: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listWebhooks(params);
        return formatResponse(result, format, 'webhooks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Webhook
  // ===========================================================================
  server.tool(
    'shopify_get_webhook',
    `Get a single webhook by ID.

Args:
  - webhookId: Webhook ID
  - format: Response format

Returns:
  The webhook details.`,
    {
      webhookId: z.number().describe('Webhook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ webhookId, format }) => {
      try {
        const webhook = await client.getWebhook(webhookId);
        return formatResponse(webhook, format, 'webhook');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Webhook
  // ===========================================================================
  server.tool(
    'shopify_create_webhook',
    `Create a new webhook subscription.

Common topics:
- orders/create, orders/updated, orders/paid, orders/cancelled, orders/fulfilled
- products/create, products/update, products/delete
- customers/create, customers/update, customers/delete
- inventory_levels/update, inventory_levels/connect, inventory_levels/disconnect
- fulfillments/create, fulfillments/update
- carts/create, carts/update
- checkouts/create, checkouts/update
- app/uninstalled, shop/update

Args:
  - topic: Event topic (required, e.g., "orders/create")
  - address: Callback URL (required, must be HTTPS)
  - format: Payload format (json or xml)
  - fields: Specific fields to include in payload
  - metafieldNamespaces: Metafield namespaces to include

Returns:
  The created webhook.`,
    {
      topic: z.string().describe('Event topic (e.g., "orders/create")'),
      address: z.string().url().describe('Callback URL (HTTPS required)'),
      format: z.enum(['json', 'xml']).optional().default('json'),
      fields: z.array(z.string()).optional(),
      metafieldNamespaces: z.array(z.string()).optional(),
    },
    async (input) => {
      try {
        const webhook = await client.createWebhook(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Webhook created', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Webhook
  // ===========================================================================
  server.tool(
    'shopify_update_webhook',
    `Update an existing webhook.

Args:
  - webhookId: Webhook ID to update
  - address: New callback URL
  - topic: New topic
  - format: New payload format
  - fields: New fields to include
  - metafieldNamespaces: New metafield namespaces

Returns:
  The updated webhook.`,
    {
      webhookId: z.number().describe('Webhook ID'),
      address: z.string().url().optional(),
      topic: z.string().optional(),
      format: z.enum(['json', 'xml']).optional(),
      fields: z.array(z.string()).optional(),
      metafieldNamespaces: z.array(z.string()).optional(),
    },
    async ({ webhookId, ...input }) => {
      try {
        const webhook = await client.updateWebhook(webhookId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Webhook updated', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Webhook
  // ===========================================================================
  server.tool(
    'shopify_delete_webhook',
    `Delete a webhook subscription.

Args:
  - webhookId: Webhook ID to delete

Returns:
  Confirmation of deletion.`,
    {
      webhookId: z.number().describe('Webhook ID'),
    },
    async ({ webhookId }) => {
      try {
        await client.deleteWebhook(webhookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Webhook ${webhookId} deleted` },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Webhook Count
  // ===========================================================================
  server.tool(
    'shopify_get_webhook_count',
    `Get the count of webhooks matching filters.

Args:
  - topic: Filter by topic
  - address: Filter by address

Returns:
  Count of matching webhooks.`,
    {
      topic: z.string().optional(),
      address: z.string().optional(),
    },
    async (params) => {
      try {
        const count = await client.getWebhookCount(params);
        return {
          content: [{ type: 'text', text: JSON.stringify({ count }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
