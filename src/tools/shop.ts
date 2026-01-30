/**
 * Shop Tools
 *
 * MCP tools for shop and connection management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register shop-related tools
 */
export function registerShopTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // Test Connection
  // ===========================================================================
  server.tool(
    'shopify_test_connection',
    `Test the connection to the Shopify store.

Verifies that the API credentials are valid and returns shop information.

Returns:
  Connection status and shop name if successful.`,
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Shop
  // ===========================================================================
  server.tool(
    'shopify_get_shop',
    `Get shop details and configuration.

Returns comprehensive information about the Shopify store including:
- Shop name, email, and owner info
- Address and timezone
- Currency and money format settings
- Plan information
- Feature flags

Args:
  - format: Response format ('json' or 'markdown')

Returns:
  Complete shop configuration object.`,
    {
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format }) => {
      try {
        const shop = await client.getShop();
        return formatResponse(shop, format, 'shop');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
