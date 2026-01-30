/**
 * Customer Tools
 *
 * MCP tools for customer management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register customer-related tools
 */
export function registerCustomerTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Customers
  // ===========================================================================
  server.tool(
    'shopify_list_customers',
    `List customers from the store with pagination and filters.

Args:
  - limit: Number of customers to return (1-250, default: 50)
  - sinceId: Return customers after this ID
  - ids: Comma-separated list of customer IDs
  - createdAtMin: Minimum created date (ISO 8601)
  - createdAtMax: Maximum created date (ISO 8601)
  - updatedAtMin: Minimum updated date
  - updatedAtMax: Maximum updated date
  - format: Response format

Returns:
  Paginated list of customers.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      ids: z.string().optional(),
      createdAtMin: z.string().optional(),
      createdAtMax: z.string().optional(),
      updatedAtMin: z.string().optional(),
      updatedAtMax: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listCustomers(params);
        return formatResponse(result, format, 'customers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Customer
  // ===========================================================================
  server.tool(
    'shopify_get_customer',
    `Get a single customer by ID.

Args:
  - customerId: The customer ID
  - format: Response format

Returns:
  The customer with all details including addresses.`,
    {
      customerId: z.number().describe('Customer ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customerId, format }) => {
      try {
        const customer = await client.getCustomer(customerId);
        return formatResponse(customer, format, 'customer');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Customer
  // ===========================================================================
  server.tool(
    'shopify_create_customer',
    `Create a new customer.

Args:
  - email: Customer email (required)
  - firstName: First name
  - lastName: Last name
  - phone: Phone number (E.164 format)
  - note: Customer note
  - tags: Comma-separated tags
  - acceptsMarketing: Marketing consent
  - addresses: Array of address objects
  - sendEmailWelcome: Send welcome email
  - sendEmailInvite: Send account invite email

Returns:
  The created customer.`,
    {
      email: z.string().email().describe('Customer email (required)'),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      note: z.string().optional(),
      tags: z.string().optional(),
      acceptsMarketing: z.boolean().optional(),
      addresses: z
        .array(
          z.object({
            address1: z.string().optional(),
            address2: z.string().optional(),
            city: z.string().optional(),
            province: z.string().optional(),
            country: z.string().optional(),
            zip: z.string().optional(),
            phone: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            company: z.string().optional(),
            default: z.boolean().optional(),
          })
        )
        .optional(),
      sendEmailWelcome: z.boolean().optional(),
      sendEmailInvite: z.boolean().optional(),
    },
    async (input) => {
      try {
        const customer = await client.createCustomer(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Customer created', customer },
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
  // Update Customer
  // ===========================================================================
  server.tool(
    'shopify_update_customer',
    `Update an existing customer.

Args:
  - customerId: Customer ID to update
  - email: New email
  - firstName: New first name
  - lastName: New last name
  - phone: New phone
  - note: New note
  - tags: New tags
  - acceptsMarketing: New marketing consent

Returns:
  The updated customer.`,
    {
      customerId: z.number().describe('Customer ID'),
      email: z.string().email().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      note: z.string().optional(),
      tags: z.string().optional(),
      acceptsMarketing: z.boolean().optional(),
    },
    async ({ customerId, ...input }) => {
      try {
        const customer = await client.updateCustomer(customerId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Customer updated', customer },
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
  // Delete Customer
  // ===========================================================================
  server.tool(
    'shopify_delete_customer',
    `Delete a customer.

Note: Customers with orders cannot be deleted.

Args:
  - customerId: Customer ID to delete

Returns:
  Confirmation of deletion.`,
    {
      customerId: z.number().describe('Customer ID'),
    },
    async ({ customerId }) => {
      try {
        await client.deleteCustomer(customerId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Customer ${customerId} deleted` },
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
  // Get Customer Count
  // ===========================================================================
  server.tool(
    'shopify_get_customer_count',
    `Get the count of customers matching filters.

Args:
  - createdAtMin: Minimum created date
  - createdAtMax: Maximum created date
  - updatedAtMin: Minimum updated date
  - updatedAtMax: Maximum updated date

Returns:
  Count of matching customers.`,
    {
      createdAtMin: z.string().optional(),
      createdAtMax: z.string().optional(),
      updatedAtMin: z.string().optional(),
      updatedAtMax: z.string().optional(),
    },
    async (params) => {
      try {
        const count = await client.getCustomerCount(params);
        return {
          content: [{ type: 'text', text: JSON.stringify({ count }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Customers
  // ===========================================================================
  server.tool(
    'shopify_search_customers',
    `Search for customers by query string.

The query can search across multiple fields like email, name, etc.

Args:
  - query: Search query (required)
  - limit: Number of results to return
  - order: Sort order (e.g., "last_order_date DESC")
  - format: Response format

Returns:
  Matching customers.`,
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      order: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.searchCustomers(params);
        return formatResponse(result, format, 'customers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Customer Orders
  // ===========================================================================
  server.tool(
    'shopify_get_customer_orders',
    `Get orders for a specific customer.

Args:
  - customerId: Customer ID
  - limit: Number of orders to return
  - status: Order status filter (any, open, closed, cancelled)
  - format: Response format

Returns:
  Customer's orders.`,
    {
      customerId: z.number().describe('Customer ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      status: z.enum(['any', 'open', 'closed', 'cancelled']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customerId, format, ...params }) => {
      try {
        const result = await client.getCustomerOrders(customerId, params);
        return formatResponse(result, format, 'orders');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
