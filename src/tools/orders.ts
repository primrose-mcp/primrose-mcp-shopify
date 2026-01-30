/**
 * Order Tools
 *
 * MCP tools for order management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register order-related tools
 */
export function registerOrderTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Orders
  // ===========================================================================
  server.tool(
    'shopify_list_orders',
    `List orders from the store with pagination and filters.

Args:
  - limit: Number of orders to return (1-250, default: 50)
  - sinceId: Return orders after this ID
  - status: Order status (open, closed, cancelled, any)
  - financialStatus: Financial status (authorized, pending, paid, partially_paid, refunded, voided, partially_refunded, any, unpaid)
  - fulfillmentStatus: Fulfillment status (shipped, partial, unshipped, any, unfulfilled)
  - createdAtMin: Minimum created date (ISO 8601)
  - createdAtMax: Maximum created date (ISO 8601)
  - updatedAtMin: Minimum updated date
  - updatedAtMax: Maximum updated date
  - processedAtMin: Minimum processed date
  - processedAtMax: Maximum processed date
  - ids: Comma-separated list of order IDs
  - format: Response format

Returns:
  Paginated list of orders.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      status: z.enum(['open', 'closed', 'cancelled', 'any']).optional(),
      financialStatus: z
        .enum([
          'authorized',
          'pending',
          'paid',
          'partially_paid',
          'refunded',
          'voided',
          'partially_refunded',
          'any',
          'unpaid',
        ])
        .optional(),
      fulfillmentStatus: z
        .enum(['shipped', 'partial', 'unshipped', 'any', 'unfulfilled'])
        .optional(),
      createdAtMin: z.string().optional(),
      createdAtMax: z.string().optional(),
      updatedAtMin: z.string().optional(),
      updatedAtMax: z.string().optional(),
      processedAtMin: z.string().optional(),
      processedAtMax: z.string().optional(),
      ids: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listOrders(params);
        return formatResponse(result, format, 'orders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Order
  // ===========================================================================
  server.tool(
    'shopify_get_order',
    `Get a single order by ID.

Args:
  - orderId: The order ID
  - format: Response format

Returns:
  The order with all details including line items, shipping, etc.`,
    {
      orderId: z.number().describe('Order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, format }) => {
      try {
        const order = await client.getOrder(orderId);
        return formatResponse(order, format, 'order');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Order
  // ===========================================================================
  server.tool(
    'shopify_create_order',
    `Create a new order (typically for importing historical orders).

Args:
  - lineItems: Array of line items (required)
    - variantId: Variant ID
    - title: Product title
    - quantity: Quantity
    - price: Price
  - customer: Customer object (id or email)
  - billingAddress: Billing address object
  - shippingAddress: Shipping address object
  - email: Customer email
  - financialStatus: Financial status
  - fulfillmentStatus: Fulfillment status
  - note: Order note
  - tags: Comma-separated tags
  - sendReceipt: Whether to send receipt email
  - sendFulfillmentReceipt: Whether to send fulfillment email

Returns:
  The created order.`,
    {
      lineItems: z
        .array(
          z.object({
            variantId: z.number().optional(),
            title: z.string().optional(),
            quantity: z.number(),
            price: z.string().optional(),
          })
        )
        .describe('Line items'),
      customer: z.object({ id: z.number().optional(), email: z.string().optional() }).optional(),
      billingAddress: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          address1: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          zip: z.string().optional(),
          phone: z.string().optional(),
        })
        .optional(),
      shippingAddress: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          address1: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          zip: z.string().optional(),
          phone: z.string().optional(),
        })
        .optional(),
      email: z.string().optional(),
      financialStatus: z.string().optional(),
      fulfillmentStatus: z.string().optional(),
      note: z.string().optional(),
      tags: z.string().optional(),
      sendReceipt: z.boolean().optional(),
      sendFulfillmentReceipt: z.boolean().optional(),
    },
    async (input) => {
      try {
        const order = await client.createOrder(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Order created', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Order
  // ===========================================================================
  server.tool(
    'shopify_update_order',
    `Update an existing order.

Args:
  - orderId: Order ID to update
  - email: New email
  - phone: New phone
  - note: New note
  - tags: New tags
  - shippingAddress: New shipping address
  - buyer_accepts_marketing: Marketing consent

Returns:
  The updated order.`,
    {
      orderId: z.number().describe('Order ID'),
      email: z.string().optional(),
      phone: z.string().optional(),
      note: z.string().optional(),
      tags: z.string().optional(),
      shippingAddress: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          address1: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          zip: z.string().optional(),
          phone: z.string().optional(),
        })
        .optional(),
      buyerAcceptsMarketing: z.boolean().optional(),
    },
    async ({ orderId, ...input }) => {
      try {
        const order = await client.updateOrder(orderId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Order updated', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Order
  // ===========================================================================
  server.tool(
    'shopify_delete_order',
    `Delete an order (moves to trash, can be restored within 60 days).

Args:
  - orderId: Order ID to delete

Returns:
  Confirmation of deletion.`,
    {
      orderId: z.number().describe('Order ID'),
    },
    async ({ orderId }) => {
      try {
        await client.deleteOrder(orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Order ${orderId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Order Count
  // ===========================================================================
  server.tool(
    'shopify_get_order_count',
    `Get the count of orders matching filters.

Args:
  - status: Order status filter
  - financialStatus: Financial status filter
  - fulfillmentStatus: Fulfillment status filter
  - createdAtMin: Minimum created date
  - createdAtMax: Maximum created date

Returns:
  Count of matching orders.`,
    {
      status: z.enum(['open', 'closed', 'cancelled', 'any']).optional(),
      financialStatus: z
        .enum([
          'authorized',
          'pending',
          'paid',
          'partially_paid',
          'refunded',
          'voided',
          'partially_refunded',
          'any',
          'unpaid',
        ])
        .optional(),
      fulfillmentStatus: z
        .enum(['shipped', 'partial', 'unshipped', 'any', 'unfulfilled'])
        .optional(),
      createdAtMin: z.string().optional(),
      createdAtMax: z.string().optional(),
    },
    async (params) => {
      try {
        const count = await client.getOrderCount(params);
        return {
          content: [{ type: 'text', text: JSON.stringify({ count }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Close Order
  // ===========================================================================
  server.tool(
    'shopify_close_order',
    `Close an order (marks as archived).

Args:
  - orderId: Order ID to close

Returns:
  The closed order.`,
    {
      orderId: z.number().describe('Order ID'),
    },
    async ({ orderId }) => {
      try {
        const order = await client.closeOrder(orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Order closed', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Open Order
  // ===========================================================================
  server.tool(
    'shopify_open_order',
    `Re-open a closed order.

Args:
  - orderId: Order ID to open

Returns:
  The re-opened order.`,
    {
      orderId: z.number().describe('Order ID'),
    },
    async ({ orderId }) => {
      try {
        const order = await client.openOrder(orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Order opened', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Cancel Order
  // ===========================================================================
  server.tool(
    'shopify_cancel_order',
    `Cancel an order.

Args:
  - orderId: Order ID to cancel
  - reason: Cancellation reason (customer, fraud, inventory, declined, other)
  - email: Send cancellation email to customer
  - restock: Restock inventory

Returns:
  The cancelled order.`,
    {
      orderId: z.number().describe('Order ID'),
      reason: z.enum(['customer', 'fraud', 'inventory', 'declined', 'other']).optional(),
      email: z.boolean().optional().describe('Send cancellation email'),
      restock: z.boolean().optional().describe('Restock inventory'),
    },
    async ({ orderId, ...params }) => {
      try {
        const order = await client.cancelOrder(orderId, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Order cancelled', order }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
