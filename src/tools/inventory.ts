/**
 * Inventory Tools
 *
 * MCP tools for inventory levels, items, and locations management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register inventory-related tools
 */
export function registerInventoryTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Locations
  // ===========================================================================
  server.tool(
    'shopify_list_locations',
    `List all inventory locations.

Locations are places where you store inventory (warehouses, retail stores, etc.).

Args:
  - limit: Number of locations to return
  - format: Response format

Returns:
  List of inventory locations.`,
    {
      limit: z.number().int().min(1).max(250).default(50).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, format }) => {
      try {
        const result = await client.listLocations({ limit });
        return formatResponse(result, format, 'locations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Location
  // ===========================================================================
  server.tool(
    'shopify_get_location',
    `Get a single location by ID.

Args:
  - locationId: Location ID
  - format: Response format

Returns:
  The location details.`,
    {
      locationId: z.number().describe('Location ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ locationId, format }) => {
      try {
        const location = await client.getLocation(locationId);
        return formatResponse(location, format, 'location');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Location Count
  // ===========================================================================
  server.tool(
    'shopify_get_location_count',
    `Get the count of locations.

Returns:
  Count of locations.`,
    {},
    async () => {
      try {
        const count = await client.getLocationCount();
        return {
          content: [{ type: 'text', text: JSON.stringify({ count }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Inventory Levels
  // ===========================================================================
  server.tool(
    'shopify_list_inventory_levels',
    `List inventory levels for items at locations.

You must provide at least one of: locationIds or inventoryItemIds.

Args:
  - locationIds: Comma-separated location IDs
  - inventoryItemIds: Comma-separated inventory item IDs
  - limit: Number of levels to return

Returns:
  List of inventory levels with available quantities.`,
    {
      locationIds: z.string().optional().describe('Comma-separated location IDs'),
      inventoryItemIds: z.string().optional().describe('Comma-separated inventory item IDs'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
    },
    async (params) => {
      try {
        const result = await client.listInventoryLevels(params);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Adjust Inventory Level
  // ===========================================================================
  server.tool(
    'shopify_adjust_inventory_level',
    `Adjust the inventory level by a relative amount.

Use this to increment or decrement inventory (e.g., +5 or -3).

Args:
  - inventoryItemId: Inventory item ID
  - locationId: Location ID
  - adjustment: Amount to adjust (positive or negative)

Returns:
  The updated inventory level.`,
    {
      inventoryItemId: z.number().describe('Inventory item ID'),
      locationId: z.number().describe('Location ID'),
      adjustment: z.number().describe('Adjustment amount (positive or negative)'),
    },
    async ({ inventoryItemId, locationId, adjustment }) => {
      try {
        const level = await client.adjustInventoryLevel(inventoryItemId, locationId, adjustment);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Inventory adjusted', level },
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
  // Set Inventory Level
  // ===========================================================================
  server.tool(
    'shopify_set_inventory_level',
    `Set the inventory level to an absolute value.

Use this to set inventory to a specific number (e.g., set to 100).

Args:
  - inventoryItemId: Inventory item ID
  - locationId: Location ID
  - available: New available quantity

Returns:
  The updated inventory level.`,
    {
      inventoryItemId: z.number().describe('Inventory item ID'),
      locationId: z.number().describe('Location ID'),
      available: z.number().describe('New available quantity'),
    },
    async ({ inventoryItemId, locationId, available }) => {
      try {
        const level = await client.setInventoryLevel(inventoryItemId, locationId, available);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Inventory set', level }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Inventory Item
  // ===========================================================================
  server.tool(
    'shopify_get_inventory_item',
    `Get an inventory item by ID.

Inventory items are connected to product variants.

Args:
  - inventoryItemId: Inventory item ID
  - format: Response format

Returns:
  The inventory item details including SKU, cost, tracking settings.`,
    {
      inventoryItemId: z.number().describe('Inventory item ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ inventoryItemId, format }) => {
      try {
        const item = await client.getInventoryItem(inventoryItemId);
        return formatResponse(item, format, 'inventoryItem');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Inventory Item
  // ===========================================================================
  server.tool(
    'shopify_update_inventory_item',
    `Update an inventory item.

Args:
  - inventoryItemId: Inventory item ID
  - sku: New SKU
  - cost: New cost
  - tracked: Whether to track inventory
  - countryCodeOfOrigin: Country of origin (ISO 3166-1 alpha-2)
  - provinceCodeOfOrigin: Province of origin
  - harmonizedSystemCode: HS tariff code

Returns:
  The updated inventory item.`,
    {
      inventoryItemId: z.number().describe('Inventory item ID'),
      sku: z.string().optional(),
      cost: z.string().optional(),
      tracked: z.boolean().optional(),
      countryCodeOfOrigin: z.string().optional(),
      provinceCodeOfOrigin: z.string().optional(),
      harmonizedSystemCode: z.string().optional(),
    },
    async ({ inventoryItemId, ...input }) => {
      try {
        const item = await client.updateInventoryItem(inventoryItemId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Inventory item updated', item },
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
