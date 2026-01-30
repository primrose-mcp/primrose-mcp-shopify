/**
 * Fulfillment Tools
 *
 * MCP tools for fulfillment and fulfillment order management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register fulfillment-related tools
 */
export function registerFulfillmentTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Fulfillments
  // ===========================================================================
  server.tool(
    'shopify_list_fulfillments',
    `List fulfillments for an order.

Args:
  - orderId: Order ID
  - limit: Number of fulfillments to return
  - format: Response format

Returns:
  List of fulfillments with tracking information.`,
    {
      orderId: z.number().describe('Order ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, limit, format }) => {
      try {
        const result = await client.listFulfillments(orderId, { limit });
        return formatResponse(result, format, 'fulfillments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Fulfillment
  // ===========================================================================
  server.tool(
    'shopify_get_fulfillment',
    `Get a single fulfillment by ID.

Args:
  - orderId: Order ID
  - fulfillmentId: Fulfillment ID
  - format: Response format

Returns:
  The fulfillment details.`,
    {
      orderId: z.number().describe('Order ID'),
      fulfillmentId: z.number().describe('Fulfillment ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, fulfillmentId, format }) => {
      try {
        const fulfillment = await client.getFulfillment(orderId, fulfillmentId);
        return formatResponse(fulfillment, format, 'fulfillment');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Fulfillment
  // ===========================================================================
  server.tool(
    'shopify_create_fulfillment',
    `Create a fulfillment for fulfillment orders.

This uses the new Fulfillment Orders API.

Args:
  - lineItemsByFulfillmentOrder: Array of fulfillment order line items
    - fulfillmentOrderId: Fulfillment order ID
    - fulfillmentOrderLineItems: Array of { id, quantity }
  - trackingInfo: Tracking information object
    - number: Tracking number
    - url: Tracking URL
    - company: Shipping company
  - notifyCustomer: Whether to send shipping notification

Returns:
  The created fulfillment.`,
    {
      lineItemsByFulfillmentOrder: z
        .array(
          z.object({
            fulfillmentOrderId: z.number(),
            fulfillmentOrderLineItems: z
              .array(
                z.object({
                  id: z.number(),
                  quantity: z.number(),
                })
              )
              .optional(),
          })
        )
        .describe('Line items to fulfill by fulfillment order'),
      trackingInfo: z
        .object({
          number: z.string().optional(),
          url: z.string().optional(),
          company: z.string().optional(),
        })
        .optional(),
      notifyCustomer: z.boolean().optional().default(true),
    },
    async (input) => {
      try {
        const fulfillment = await client.createFulfillment(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Fulfillment created', fulfillment },
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
  // Update Fulfillment Tracking
  // ===========================================================================
  server.tool(
    'shopify_update_fulfillment_tracking',
    `Update tracking information for a fulfillment.

Args:
  - fulfillmentId: Fulfillment ID
  - trackingInfo: New tracking information
    - number: Tracking number
    - url: Tracking URL
    - company: Shipping company
  - notifyCustomer: Whether to notify customer of update

Returns:
  The updated fulfillment.`,
    {
      fulfillmentId: z.number().describe('Fulfillment ID'),
      trackingInfo: z.object({
        number: z.string().optional(),
        url: z.string().optional(),
        company: z.string().optional(),
      }),
      notifyCustomer: z.boolean().optional().default(false),
    },
    async ({ fulfillmentId, ...input }) => {
      try {
        const fulfillment = await client.updateFulfillmentTracking(fulfillmentId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Tracking updated', fulfillment },
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
  // Cancel Fulfillment
  // ===========================================================================
  server.tool(
    'shopify_cancel_fulfillment',
    `Cancel a fulfillment.

Args:
  - fulfillmentId: Fulfillment ID to cancel

Returns:
  The cancelled fulfillment.`,
    {
      fulfillmentId: z.number().describe('Fulfillment ID'),
    },
    async ({ fulfillmentId }) => {
      try {
        const fulfillment = await client.cancelFulfillment(fulfillmentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Fulfillment cancelled', fulfillment },
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
  // List Fulfillment Orders
  // ===========================================================================
  server.tool(
    'shopify_list_fulfillment_orders',
    `List fulfillment orders for an order.

Fulfillment orders represent groups of items to be fulfilled together.

Args:
  - orderId: Order ID
  - format: Response format

Returns:
  List of fulfillment orders with their line items.`,
    {
      orderId: z.number().describe('Order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, format }) => {
      try {
        const fulfillmentOrders = await client.listFulfillmentOrders(orderId);
        return formatResponse(
          { items: fulfillmentOrders, count: fulfillmentOrders.length, hasMore: false },
          format,
          'fulfillmentOrders'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Fulfillment Order
  // ===========================================================================
  server.tool(
    'shopify_get_fulfillment_order',
    `Get a single fulfillment order by ID.

Args:
  - fulfillmentOrderId: Fulfillment order ID
  - format: Response format

Returns:
  The fulfillment order details.`,
    {
      fulfillmentOrderId: z.number().describe('Fulfillment order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ fulfillmentOrderId, format }) => {
      try {
        const fulfillmentOrder = await client.getFulfillmentOrder(fulfillmentOrderId);
        return formatResponse(fulfillmentOrder, format, 'fulfillmentOrder');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
