/**
 * Transaction and Refund Tools
 *
 * MCP tools for payment transactions and refunds management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register transaction and refund-related tools
 */
export function registerTransactionTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Transactions
  // ===========================================================================
  server.tool(
    'shopify_list_transactions',
    `List all transactions for an order.

Transactions represent payments, refunds, and other monetary operations.

Args:
  - orderId: Order ID
  - format: Response format

Returns:
  List of transactions.`,
    {
      orderId: z.number().describe('Order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, format }) => {
      try {
        const transactions = await client.listTransactions(orderId);
        return formatResponse(
          { items: transactions, count: transactions.length, hasMore: false },
          format,
          'transactions'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Transaction
  // ===========================================================================
  server.tool(
    'shopify_get_transaction',
    `Get a single transaction by ID.

Args:
  - orderId: Order ID
  - transactionId: Transaction ID
  - format: Response format

Returns:
  The transaction details.`,
    {
      orderId: z.number().describe('Order ID'),
      transactionId: z.number().describe('Transaction ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, transactionId, format }) => {
      try {
        const transaction = await client.getTransaction(orderId, transactionId);
        return formatResponse(transaction, format, 'transaction');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Transaction
  // ===========================================================================
  server.tool(
    'shopify_create_transaction',
    `Create a transaction for an order.

Use this to capture authorized payments or record external payments.

Args:
  - orderId: Order ID
  - kind: Transaction kind (authorization, capture, sale, void, refund)
  - amount: Transaction amount
  - currency: Currency code (optional)
  - parentId: Parent transaction ID (for captures/refunds)
  - gateway: Payment gateway used

Returns:
  The created transaction.`,
    {
      orderId: z.number().describe('Order ID'),
      kind: z
        .enum(['authorization', 'capture', 'sale', 'void', 'refund'])
        .describe('Transaction kind'),
      amount: z.string().optional().describe('Transaction amount'),
      currency: z.string().optional().describe('Currency code'),
      parentId: z.number().optional().describe('Parent transaction ID'),
      gateway: z.string().optional().describe('Payment gateway'),
    },
    async ({ orderId, ...input }) => {
      try {
        const transaction = await client.createTransaction(orderId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Transaction created', transaction },
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
  // List Refunds
  // ===========================================================================
  server.tool(
    'shopify_list_refunds',
    `List all refunds for an order.

Args:
  - orderId: Order ID
  - format: Response format

Returns:
  List of refunds with line items and amounts.`,
    {
      orderId: z.number().describe('Order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, format }) => {
      try {
        const refunds = await client.listRefunds(orderId);
        return formatResponse(
          { items: refunds, count: refunds.length, hasMore: false },
          format,
          'refunds'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Refund
  // ===========================================================================
  server.tool(
    'shopify_get_refund',
    `Get a single refund by ID.

Args:
  - orderId: Order ID
  - refundId: Refund ID
  - format: Response format

Returns:
  The refund details.`,
    {
      orderId: z.number().describe('Order ID'),
      refundId: z.number().describe('Refund ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orderId, refundId, format }) => {
      try {
        const refund = await client.getRefund(orderId, refundId);
        return formatResponse(refund, format, 'refund');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Calculate Refund
  // ===========================================================================
  server.tool(
    'shopify_calculate_refund',
    `Calculate the refund amounts before creating a refund.

Use this to preview what a refund would look like.

Args:
  - orderId: Order ID
  - refundLineItems: Array of line items to refund
    - lineItemId: Line item ID
    - quantity: Quantity to refund
    - restockType: How to handle inventory (no_restock, cancel, return)
  - shipping: Shipping refund object
    - fullRefund: Whether to fully refund shipping
    - amount: Specific amount to refund

Returns:
  Calculated refund amounts.`,
    {
      orderId: z.number().describe('Order ID'),
      refundLineItems: z
        .array(
          z.object({
            lineItemId: z.number(),
            quantity: z.number(),
            restockType: z.enum(['no_restock', 'cancel', 'return']).optional(),
          })
        )
        .optional(),
      shipping: z
        .object({
          fullRefund: z.boolean().optional(),
          amount: z.string().optional(),
        })
        .optional(),
    },
    async ({ orderId, ...input }) => {
      try {
        const refund = await client.calculateRefund(orderId, input);
        return {
          content: [{ type: 'text', text: JSON.stringify({ calculated: true, refund }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Refund
  // ===========================================================================
  server.tool(
    'shopify_create_refund',
    `Create a refund for an order.

Args:
  - orderId: Order ID
  - refundLineItems: Array of line items to refund
    - lineItemId: Line item ID
    - quantity: Quantity to refund
    - restockType: How to handle inventory (no_restock, cancel, return)
  - shipping: Shipping refund object
    - fullRefund: Whether to fully refund shipping
    - amount: Specific amount to refund
  - notify: Whether to send refund notification to customer
  - note: Refund note
  - transactions: Refund transaction details
    - parentId: Parent transaction ID
    - amount: Amount to refund
    - kind: Transaction kind (usually 'refund')
    - gateway: Payment gateway

Returns:
  The created refund.`,
    {
      orderId: z.number().describe('Order ID'),
      refundLineItems: z
        .array(
          z.object({
            lineItemId: z.number(),
            quantity: z.number(),
            restockType: z.enum(['no_restock', 'cancel', 'return']).optional(),
          })
        )
        .optional(),
      shipping: z
        .object({
          fullRefund: z.boolean().optional(),
          amount: z.string().optional(),
        })
        .optional(),
      notify: z.boolean().optional().default(true),
      note: z.string().optional(),
      transactions: z
        .array(
          z.object({
            parentId: z.number().optional(),
            amount: z.string(),
            kind: z.string().optional(),
            gateway: z.string().optional(),
          })
        )
        .optional(),
    },
    async ({ orderId, ...input }) => {
      try {
        const refund = await client.createRefund(orderId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Refund created', refund }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
