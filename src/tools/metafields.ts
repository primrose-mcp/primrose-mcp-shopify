/**
 * Metafield Tools
 *
 * MCP tools for metafield management across resources.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register metafield-related tools
 */
export function registerMetafieldTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Metafields
  // ===========================================================================
  server.tool(
    'shopify_list_metafields',
    `List metafields for a resource.

Metafields store custom data for products, customers, orders, etc.

Args:
  - ownerResource: Resource type (products, customers, orders, collections, etc.)
  - ownerId: Resource ID
  - limit: Number of metafields to return
  - namespace: Filter by namespace
  - key: Filter by key
  - format: Response format

Returns:
  Paginated list of metafields.`,
    {
      ownerResource: z.string().describe('Resource type (e.g., "products")'),
      ownerId: z.number().describe('Resource ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      namespace: z.string().optional(),
      key: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ownerResource, ownerId, format, ...params }) => {
      try {
        const result = await client.listMetafields(ownerResource, ownerId, params);
        return formatResponse(result, format, 'metafields');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Metafield
  // ===========================================================================
  server.tool(
    'shopify_get_metafield',
    `Get a single metafield by ID.

Args:
  - ownerResource: Resource type
  - ownerId: Resource ID
  - metafieldId: Metafield ID
  - format: Response format

Returns:
  The metafield details.`,
    {
      ownerResource: z.string().describe('Resource type'),
      ownerId: z.number().describe('Resource ID'),
      metafieldId: z.number().describe('Metafield ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ownerResource, ownerId, metafieldId, format }) => {
      try {
        const metafield = await client.getMetafield(ownerResource, ownerId, metafieldId);
        return formatResponse(metafield, format, 'metafield');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Metafield
  // ===========================================================================
  server.tool(
    'shopify_create_metafield',
    `Create a metafield for a resource.

Common types:
- single_line_text_field, multi_line_text_field
- number_integer, number_decimal
- boolean
- json
- date, date_time
- color, url, rating
- dimension, weight, volume
- product_reference, variant_reference, collection_reference
- file_reference

Args:
  - ownerResource: Resource type (products, customers, orders, etc.)
  - ownerId: Resource ID
  - namespace: Metafield namespace (required)
  - key: Metafield key (required)
  - value: Metafield value (required)
  - type: Metafield type (required)
  - description: Description

Returns:
  The created metafield.`,
    {
      ownerResource: z.string().describe('Resource type'),
      ownerId: z.number().describe('Resource ID'),
      namespace: z.string().describe('Metafield namespace'),
      key: z.string().describe('Metafield key'),
      value: z.string().describe('Metafield value'),
      type: z.string().describe('Metafield type'),
      description: z.string().optional(),
    },
    async ({ ownerResource, ownerId, ...input }) => {
      try {
        const metafield = await client.createMetafield(ownerResource, ownerId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Metafield created', metafield },
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
  // Update Metafield
  // ===========================================================================
  server.tool(
    'shopify_update_metafield',
    `Update an existing metafield.

Args:
  - ownerResource: Resource type
  - ownerId: Resource ID
  - metafieldId: Metafield ID
  - value: New value
  - type: New type (optional)

Returns:
  The updated metafield.`,
    {
      ownerResource: z.string().describe('Resource type'),
      ownerId: z.number().describe('Resource ID'),
      metafieldId: z.number().describe('Metafield ID'),
      value: z.string().describe('New value'),
      type: z.string().optional(),
    },
    async ({ ownerResource, ownerId, metafieldId, ...input }) => {
      try {
        const metafield = await client.updateMetafield(ownerResource, ownerId, metafieldId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Metafield updated', metafield },
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
  // Delete Metafield
  // ===========================================================================
  server.tool(
    'shopify_delete_metafield',
    `Delete a metafield.

Args:
  - ownerResource: Resource type
  - ownerId: Resource ID
  - metafieldId: Metafield ID to delete

Returns:
  Confirmation of deletion.`,
    {
      ownerResource: z.string().describe('Resource type'),
      ownerId: z.number().describe('Resource ID'),
      metafieldId: z.number().describe('Metafield ID'),
    },
    async ({ ownerResource, ownerId, metafieldId }) => {
      try {
        await client.deleteMetafield(ownerResource, ownerId, metafieldId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Metafield ${metafieldId} deleted` },
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
  // List Shop Metafields
  // ===========================================================================
  server.tool(
    'shopify_list_shop_metafields',
    `List metafields attached to the shop itself.

Args:
  - limit: Number of metafields to return
  - namespace: Filter by namespace
  - key: Filter by key
  - format: Response format

Returns:
  Paginated list of shop metafields.`,
    {
      limit: z.number().int().min(1).max(250).default(50).optional(),
      namespace: z.string().optional(),
      key: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listShopMetafields(params);
        return formatResponse(result, format, 'metafields');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Shop Metafield
  // ===========================================================================
  server.tool(
    'shopify_create_shop_metafield',
    `Create a metafield for the shop.

Args:
  - namespace: Metafield namespace (required)
  - key: Metafield key (required)
  - value: Metafield value (required)
  - type: Metafield type (required)
  - description: Description

Returns:
  The created shop metafield.`,
    {
      namespace: z.string().describe('Metafield namespace'),
      key: z.string().describe('Metafield key'),
      value: z.string().describe('Metafield value'),
      type: z.string().describe('Metafield type'),
      description: z.string().optional(),
    },
    async (input) => {
      try {
        const metafield = await client.createShopMetafield(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Shop metafield created', metafield },
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
}
