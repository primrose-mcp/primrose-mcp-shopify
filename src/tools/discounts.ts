/**
 * Discount Tools
 *
 * MCP tools for price rules and discount codes management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register discount-related tools
 */
export function registerDiscountTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Price Rules
  // ===========================================================================
  server.tool(
    'shopify_list_price_rules',
    `List price rules with pagination and filters.

Price rules define discount logic (percentage off, fixed amount, buy X get Y, etc.).

Args:
  - limit: Number of price rules to return (1-250, default: 50)
  - sinceId: Return price rules after this ID
  - startsAt: Filter by start date
  - endsAt: Filter by end date
  - format: Response format

Returns:
  Paginated list of price rules.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      startsAt: z.string().optional(),
      endsAt: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listPriceRules(params);
        return formatResponse(result, format, 'priceRules');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Price Rule
  // ===========================================================================
  server.tool(
    'shopify_get_price_rule',
    `Get a single price rule by ID.

Args:
  - priceRuleId: Price rule ID
  - format: Response format

Returns:
  The price rule details.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ priceRuleId, format }) => {
      try {
        const priceRule = await client.getPriceRule(priceRuleId);
        return formatResponse(priceRule, format, 'priceRule');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Price Rule
  // ===========================================================================
  server.tool(
    'shopify_create_price_rule',
    `Create a new price rule.

Args:
  - title: Price rule title (required)
  - targetType: What the rule applies to (line_item, shipping_line)
  - targetSelection: Which items to apply to (all, entitled)
  - allocationMethod: How to apply discount (across, each)
  - valueType: Type of discount (fixed_amount, percentage)
  - value: Discount value (negative for discounts, e.g., "-10.00" or "-10")
  - customerSelection: Who can use (all, prerequisite)
  - startsAt: Start date (ISO 8601)
  - endsAt: End date (ISO 8601, optional)
  - oncePerCustomer: Limit to one use per customer
  - usageLimit: Total usage limit
  - prerequisiteSubtotalRange: Minimum subtotal requirement
  - prerequisiteQuantityRange: Minimum quantity requirement
  - prerequisiteToEntitlementQuantityRatio: Buy X get Y ratio
  - entitledProductIds: Product IDs the discount applies to
  - entitledVariantIds: Variant IDs the discount applies to
  - entitledCollectionIds: Collection IDs the discount applies to
  - entitledCountryIds: Country IDs for shipping discounts
  - prerequisiteProductIds: Required product IDs
  - prerequisiteVariantIds: Required variant IDs
  - prerequisiteCollectionIds: Required collection IDs
  - prerequisiteCustomerIds: Required customer IDs

Returns:
  The created price rule.`,
    {
      title: z.string().describe('Price rule title (required)'),
      targetType: z.enum(['line_item', 'shipping_line']).describe('Target type'),
      targetSelection: z.enum(['all', 'entitled']).describe('Target selection'),
      allocationMethod: z.enum(['across', 'each']).describe('Allocation method'),
      valueType: z.enum(['fixed_amount', 'percentage']).describe('Value type'),
      value: z.string().describe('Discount value (negative, e.g., "-10.00")'),
      customerSelection: z.enum(['all', 'prerequisite']).describe('Customer selection'),
      startsAt: z.string().describe('Start date (ISO 8601)'),
      endsAt: z.string().optional(),
      oncePerCustomer: z.boolean().optional(),
      usageLimit: z.number().optional(),
      prerequisiteSubtotalRange: z.object({ greaterThanOrEqualTo: z.string() }).optional(),
      prerequisiteQuantityRange: z.object({ greaterThanOrEqualTo: z.number() }).optional(),
      prerequisiteToEntitlementQuantityRatio: z
        .object({ prerequisiteQuantity: z.number(), entitledQuantity: z.number() })
        .optional(),
      entitledProductIds: z.array(z.number()).optional(),
      entitledVariantIds: z.array(z.number()).optional(),
      entitledCollectionIds: z.array(z.number()).optional(),
      entitledCountryIds: z.array(z.number()).optional(),
      prerequisiteProductIds: z.array(z.number()).optional(),
      prerequisiteVariantIds: z.array(z.number()).optional(),
      prerequisiteCollectionIds: z.array(z.number()).optional(),
      prerequisiteCustomerIds: z.array(z.number()).optional(),
    },
    async (input) => {
      try {
        const priceRule = await client.createPriceRule(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Price rule created', priceRule },
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
  // Update Price Rule
  // ===========================================================================
  server.tool(
    'shopify_update_price_rule',
    `Update an existing price rule.

Args:
  - priceRuleId: Price rule ID to update
  - title: New title
  - value: New discount value
  - startsAt: New start date
  - endsAt: New end date
  - usageLimit: New usage limit
  - oncePerCustomer: New once per customer setting

Returns:
  The updated price rule.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      title: z.string().optional(),
      value: z.string().optional(),
      startsAt: z.string().optional(),
      endsAt: z.string().optional(),
      usageLimit: z.number().optional(),
      oncePerCustomer: z.boolean().optional(),
    },
    async ({ priceRuleId, ...input }) => {
      try {
        const priceRule = await client.updatePriceRule(priceRuleId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Price rule updated', priceRule },
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
  // Delete Price Rule
  // ===========================================================================
  server.tool(
    'shopify_delete_price_rule',
    `Delete a price rule and all associated discount codes.

Args:
  - priceRuleId: Price rule ID to delete

Returns:
  Confirmation of deletion.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
    },
    async ({ priceRuleId }) => {
      try {
        await client.deletePriceRule(priceRuleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Price rule ${priceRuleId} deleted` },
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
  // List Discount Codes
  // ===========================================================================
  server.tool(
    'shopify_list_discount_codes',
    `List discount codes for a price rule.

Discount codes are the actual codes customers enter at checkout.

Args:
  - priceRuleId: Price rule ID
  - format: Response format

Returns:
  List of discount codes.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ priceRuleId, format }) => {
      try {
        const discountCodes = await client.listDiscountCodes(priceRuleId);
        return formatResponse(
          { items: discountCodes, count: discountCodes.length, hasMore: false },
          format,
          'discountCodes'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Discount Code
  // ===========================================================================
  server.tool(
    'shopify_get_discount_code',
    `Get a single discount code by ID.

Args:
  - priceRuleId: Price rule ID
  - discountCodeId: Discount code ID
  - format: Response format

Returns:
  The discount code details.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      discountCodeId: z.number().describe('Discount code ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ priceRuleId, discountCodeId, format }) => {
      try {
        const discountCode = await client.getDiscountCode(priceRuleId, discountCodeId);
        return formatResponse(discountCode, format, 'discountCode');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Discount Code
  // ===========================================================================
  server.tool(
    'shopify_create_discount_code',
    `Create a discount code for a price rule.

Args:
  - priceRuleId: Price rule ID
  - code: The discount code string (required, e.g., "SAVE10")

Returns:
  The created discount code.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      code: z.string().describe('Discount code string'),
    },
    async ({ priceRuleId, code }) => {
      try {
        const discountCode = await client.createDiscountCode(priceRuleId, { code });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Discount code created', discountCode },
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
  // Update Discount Code
  // ===========================================================================
  server.tool(
    'shopify_update_discount_code',
    `Update a discount code.

Args:
  - priceRuleId: Price rule ID
  - discountCodeId: Discount code ID
  - code: New discount code string

Returns:
  The updated discount code.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      discountCodeId: z.number().describe('Discount code ID'),
      code: z.string().describe('New discount code string'),
    },
    async ({ priceRuleId, discountCodeId, code }) => {
      try {
        const discountCode = await client.updateDiscountCode(priceRuleId, discountCodeId, code);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Discount code updated', discountCode },
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
  // Delete Discount Code
  // ===========================================================================
  server.tool(
    'shopify_delete_discount_code',
    `Delete a discount code.

Args:
  - priceRuleId: Price rule ID
  - discountCodeId: Discount code ID to delete

Returns:
  Confirmation of deletion.`,
    {
      priceRuleId: z.number().describe('Price rule ID'),
      discountCodeId: z.number().describe('Discount code ID'),
    },
    async ({ priceRuleId, discountCodeId }) => {
      try {
        await client.deleteDiscountCode(priceRuleId, discountCodeId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Discount code ${discountCodeId} deleted` },
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
