/**
 * Draft Order Tools
 *
 * MCP tools for draft order management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register draft order-related tools
 */
export function registerDraftOrderTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Draft Orders
  // ===========================================================================
  server.tool(
    'shopify_list_draft_orders',
    `List draft orders with pagination and filters.

Draft orders are orders that haven't been completed yet.

Args:
  - limit: Number of draft orders to return (1-250, default: 50)
  - sinceId: Return draft orders after this ID
  - status: Filter by status (open, invoice_sent, completed)
  - updatedAtMin: Minimum updated date
  - updatedAtMax: Maximum updated date
  - format: Response format

Returns:
  Paginated list of draft orders.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      status: z.enum(['open', 'invoice_sent', 'completed']).optional(),
      updatedAtMin: z.string().optional(),
      updatedAtMax: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listDraftOrders(params);
        return formatResponse(result, format, 'draftOrders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Draft Order
  // ===========================================================================
  server.tool(
    'shopify_get_draft_order',
    `Get a single draft order by ID.

Args:
  - draftOrderId: Draft order ID
  - format: Response format

Returns:
  The draft order with all details.`,
    {
      draftOrderId: z.number().describe('Draft order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ draftOrderId, format }) => {
      try {
        const draftOrder = await client.getDraftOrder(draftOrderId);
        return formatResponse(draftOrder, format, 'draftOrder');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Draft Order
  // ===========================================================================
  server.tool(
    'shopify_create_draft_order',
    `Create a new draft order.

Args:
  - lineItems: Array of line items (required)
    - variantId: Product variant ID
    - title: Custom line item title
    - quantity: Quantity
    - price: Price per item
  - customer: Customer object (id or email)
  - email: Customer email
  - shippingAddress: Shipping address object
  - billingAddress: Billing address object
  - note: Order note
  - tags: Comma-separated tags
  - useCustomerDefaultAddress: Use customer's default address
  - taxExempt: Whether order is tax exempt
  - appliedDiscount: Discount to apply
    - title: Discount title
    - value: Discount value
    - valueType: Type (fixed_amount or percentage)

Returns:
  The created draft order.`,
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
      email: z.string().optional(),
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
      note: z.string().optional(),
      tags: z.string().optional(),
      useCustomerDefaultAddress: z.boolean().optional(),
      taxExempt: z.boolean().optional(),
      appliedDiscount: z
        .object({
          title: z.string().optional(),
          value: z.string(),
          valueType: z.enum(['fixed_amount', 'percentage']),
        })
        .optional(),
    },
    async (input) => {
      try {
        const draftOrder = await client.createDraftOrder(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Draft order created', draftOrder },
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
  // Update Draft Order
  // ===========================================================================
  server.tool(
    'shopify_update_draft_order',
    `Update an existing draft order.

Args:
  - draftOrderId: Draft order ID
  - lineItems: New line items array
  - customer: New customer
  - email: New email
  - shippingAddress: New shipping address
  - billingAddress: New billing address
  - note: New note
  - tags: New tags
  - appliedDiscount: New discount

Returns:
  The updated draft order.`,
    {
      draftOrderId: z.number().describe('Draft order ID'),
      lineItems: z
        .array(
          z.object({
            variantId: z.number().optional(),
            title: z.string().optional(),
            quantity: z.number(),
            price: z.string().optional(),
          })
        )
        .optional(),
      customer: z.object({ id: z.number().optional(), email: z.string().optional() }).optional(),
      email: z.string().optional(),
      shippingAddress: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          address1: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          zip: z.string().optional(),
        })
        .optional(),
      billingAddress: z
        .object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          address1: z.string().optional(),
          city: z.string().optional(),
          province: z.string().optional(),
          country: z.string().optional(),
          zip: z.string().optional(),
        })
        .optional(),
      note: z.string().optional(),
      tags: z.string().optional(),
      appliedDiscount: z
        .object({
          title: z.string().optional(),
          value: z.string(),
          valueType: z.enum(['fixed_amount', 'percentage']),
        })
        .optional(),
    },
    async ({ draftOrderId, ...input }) => {
      try {
        const draftOrder = await client.updateDraftOrder(draftOrderId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Draft order updated', draftOrder },
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
  // Delete Draft Order
  // ===========================================================================
  server.tool(
    'shopify_delete_draft_order',
    `Delete a draft order.

Args:
  - draftOrderId: Draft order ID to delete

Returns:
  Confirmation of deletion.`,
    {
      draftOrderId: z.number().describe('Draft order ID'),
    },
    async ({ draftOrderId }) => {
      try {
        await client.deleteDraftOrder(draftOrderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Draft order ${draftOrderId} deleted` },
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
  // Complete Draft Order
  // ===========================================================================
  server.tool(
    'shopify_complete_draft_order',
    `Complete a draft order and convert it to a real order.

Args:
  - draftOrderId: Draft order ID to complete
  - paymentPending: If true, marks payment as pending (default: false)

Returns:
  The completed draft order with the created order ID.`,
    {
      draftOrderId: z.number().describe('Draft order ID'),
      paymentPending: z.boolean().optional().default(false),
    },
    async ({ draftOrderId, paymentPending }) => {
      try {
        const draftOrder = await client.completeDraftOrder(draftOrderId, paymentPending);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Draft order completed', draftOrder },
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
  // Send Draft Order Invoice
  // ===========================================================================
  server.tool(
    'shopify_send_draft_order_invoice',
    `Send an invoice for a draft order to the customer.

Args:
  - draftOrderId: Draft order ID
  - to: Recipient email (optional, defaults to customer email)
  - from: Sender email (optional, defaults to shop email)
  - subject: Email subject (optional)
  - customMessage: Custom message to include (optional)

Returns:
  The invoice details.`,
    {
      draftOrderId: z.number().describe('Draft order ID'),
      to: z.string().email().optional(),
      from: z.string().email().optional(),
      subject: z.string().optional(),
      customMessage: z.string().optional(),
    },
    async ({ draftOrderId, ...params }) => {
      try {
        const result = await client.sendDraftOrderInvoice(draftOrderId, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Invoice sent', ...result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
