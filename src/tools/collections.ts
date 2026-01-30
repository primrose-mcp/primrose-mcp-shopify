/**
 * Collection Tools
 *
 * MCP tools for custom collections, smart collections, and collects management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register collection-related tools
 */
export function registerCollectionTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Custom Collections
  // ===========================================================================
  server.tool(
    'shopify_list_custom_collections',
    `List custom collections with pagination and filters.

Custom collections are manually curated product groups.

Args:
  - limit: Number of collections to return (1-250, default: 50)
  - sinceId: Return collections after this ID
  - title: Filter by title
  - productId: Filter by product
  - handle: Filter by handle
  - publishedStatus: Filter by published status
  - format: Response format

Returns:
  Paginated list of custom collections.`,
    {
      limit: z
        .number()
        .int()
        .min(1)
        .max(250)
        .default(50)
        .describe('Number of collections to return'),
      sinceId: z.string().optional(),
      title: z.string().optional(),
      productId: z.string().optional(),
      handle: z.string().optional(),
      publishedStatus: z.enum(['published', 'unpublished', 'any']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listCustomCollections(params);
        return formatResponse(result, format, 'customCollections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Custom Collection
  // ===========================================================================
  server.tool(
    'shopify_get_custom_collection',
    `Get a single custom collection by ID.

Args:
  - collectionId: Collection ID
  - format: Response format

Returns:
  The custom collection details.`,
    {
      collectionId: z.number().describe('Collection ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ collectionId, format }) => {
      try {
        const collection = await client.getCustomCollection(collectionId);
        return formatResponse(collection, format, 'customCollection');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Custom Collection
  // ===========================================================================
  server.tool(
    'shopify_create_custom_collection',
    `Create a new custom collection.

Args:
  - title: Collection title (required)
  - bodyHtml: Description HTML
  - handle: URL handle
  - published: Whether to publish
  - sortOrder: Sort order (alpha-asc, alpha-desc, best-selling, created, created-desc, manual, price-asc, price-desc)
  - image: Image object with src or attachment

Returns:
  The created collection.`,
    {
      title: z.string().describe('Collection title (required)'),
      bodyHtml: z.string().optional(),
      handle: z.string().optional(),
      published: z.boolean().optional(),
      sortOrder: z
        .enum([
          'alpha-asc',
          'alpha-desc',
          'best-selling',
          'created',
          'created-desc',
          'manual',
          'price-asc',
          'price-desc',
        ])
        .optional(),
      image: z.object({ src: z.string().optional(), alt: z.string().optional() }).optional(),
    },
    async (input) => {
      try {
        const collection = await client.createCustomCollection(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Collection created', collection },
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
  // Update Custom Collection
  // ===========================================================================
  server.tool(
    'shopify_update_custom_collection',
    `Update an existing custom collection.

Args:
  - collectionId: Collection ID to update
  - title: New title
  - bodyHtml: New description
  - handle: New handle
  - published: New published state
  - sortOrder: New sort order

Returns:
  The updated collection.`,
    {
      collectionId: z.number().describe('Collection ID'),
      title: z.string().optional(),
      bodyHtml: z.string().optional(),
      handle: z.string().optional(),
      published: z.boolean().optional(),
      sortOrder: z
        .enum([
          'alpha-asc',
          'alpha-desc',
          'best-selling',
          'created',
          'created-desc',
          'manual',
          'price-asc',
          'price-desc',
        ])
        .optional(),
    },
    async ({ collectionId, ...input }) => {
      try {
        const collection = await client.updateCustomCollection(collectionId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Collection updated', collection },
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
  // Delete Custom Collection
  // ===========================================================================
  server.tool(
    'shopify_delete_custom_collection',
    `Delete a custom collection.

Args:
  - collectionId: Collection ID to delete

Returns:
  Confirmation of deletion.`,
    {
      collectionId: z.number().describe('Collection ID'),
    },
    async ({ collectionId }) => {
      try {
        await client.deleteCustomCollection(collectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Collection ${collectionId} deleted` },
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
  // List Smart Collections
  // ===========================================================================
  server.tool(
    'shopify_list_smart_collections',
    `List smart collections with pagination and filters.

Smart collections automatically include products based on rules.

Args:
  - limit: Number of collections to return (1-250, default: 50)
  - sinceId: Return collections after this ID
  - title: Filter by title
  - productId: Filter by product
  - handle: Filter by handle
  - publishedStatus: Filter by published status
  - format: Response format

Returns:
  Paginated list of smart collections.`,
    {
      limit: z.number().int().min(1).max(250).default(50),
      sinceId: z.string().optional(),
      title: z.string().optional(),
      productId: z.string().optional(),
      handle: z.string().optional(),
      publishedStatus: z.enum(['published', 'unpublished', 'any']).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listSmartCollections(params);
        return formatResponse(result, format, 'smartCollections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Smart Collection
  // ===========================================================================
  server.tool(
    'shopify_get_smart_collection',
    `Get a single smart collection by ID.

Args:
  - collectionId: Collection ID
  - format: Response format

Returns:
  The smart collection with its rules.`,
    {
      collectionId: z.number().describe('Collection ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ collectionId, format }) => {
      try {
        const collection = await client.getSmartCollection(collectionId);
        return formatResponse(collection, format, 'smartCollection');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Smart Collection
  // ===========================================================================
  server.tool(
    'shopify_create_smart_collection',
    `Create a new smart collection with automated rules.

Args:
  - title: Collection title (required)
  - rules: Array of rule objects (required)
    - column: Field to match (title, type, vendor, variant_price, tag, etc.)
    - relation: Comparison (equals, not_equals, greater_than, less_than, starts_with, ends_with, contains)
    - condition: Value to match
  - disjunctive: If true, products match ANY rule; if false, products must match ALL rules
  - bodyHtml: Description HTML
  - handle: URL handle
  - published: Whether to publish
  - sortOrder: Sort order

Returns:
  The created smart collection.`,
    {
      title: z.string().describe('Collection title (required)'),
      rules: z
        .array(
          z.object({
            column: z.string().describe('Field to match'),
            relation: z.string().describe('Comparison operator'),
            condition: z.string().describe('Value to match'),
          })
        )
        .describe('Collection rules'),
      disjunctive: z.boolean().optional().describe('Match any rule (true) or all rules (false)'),
      bodyHtml: z.string().optional(),
      handle: z.string().optional(),
      published: z.boolean().optional(),
      sortOrder: z
        .enum([
          'alpha-asc',
          'alpha-desc',
          'best-selling',
          'created',
          'created-desc',
          'manual',
          'price-asc',
          'price-desc',
        ])
        .optional(),
    },
    async (input) => {
      try {
        const collection = await client.createSmartCollection(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Smart collection created', collection },
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
  // Update Smart Collection
  // ===========================================================================
  server.tool(
    'shopify_update_smart_collection',
    `Update an existing smart collection.

Args:
  - collectionId: Collection ID to update
  - title: New title
  - rules: New rules array
  - disjunctive: New disjunctive setting
  - bodyHtml: New description
  - handle: New handle
  - published: New published state
  - sortOrder: New sort order

Returns:
  The updated smart collection.`,
    {
      collectionId: z.number().describe('Collection ID'),
      title: z.string().optional(),
      rules: z
        .array(
          z.object({
            column: z.string(),
            relation: z.string(),
            condition: z.string(),
          })
        )
        .optional(),
      disjunctive: z.boolean().optional(),
      bodyHtml: z.string().optional(),
      handle: z.string().optional(),
      published: z.boolean().optional(),
      sortOrder: z
        .enum([
          'alpha-asc',
          'alpha-desc',
          'best-selling',
          'created',
          'created-desc',
          'manual',
          'price-asc',
          'price-desc',
        ])
        .optional(),
    },
    async ({ collectionId, ...input }) => {
      try {
        const collection = await client.updateSmartCollection(collectionId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Smart collection updated', collection },
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
  // Delete Smart Collection
  // ===========================================================================
  server.tool(
    'shopify_delete_smart_collection',
    `Delete a smart collection.

Args:
  - collectionId: Collection ID to delete

Returns:
  Confirmation of deletion.`,
    {
      collectionId: z.number().describe('Collection ID'),
    },
    async ({ collectionId }) => {
      try {
        await client.deleteSmartCollection(collectionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Smart collection ${collectionId} deleted` },
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
  // Get Collection
  // ===========================================================================
  server.tool(
    'shopify_get_collection',
    `Get any collection by ID (custom or smart).

Args:
  - collectionId: Collection ID
  - format: Response format

Returns:
  The collection details.`,
    {
      collectionId: z.number().describe('Collection ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ collectionId, format }) => {
      try {
        const collection = await client.getCollection(collectionId);
        return formatResponse(collection, format, 'collection');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Collection Products
  // ===========================================================================
  server.tool(
    'shopify_list_collection_products',
    `List products in a collection.

Args:
  - collectionId: Collection ID
  - limit: Number of products to return
  - format: Response format

Returns:
  Paginated list of products in the collection.`,
    {
      collectionId: z.number().describe('Collection ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ collectionId, limit, format }) => {
      try {
        const result = await client.listCollectionProducts(collectionId, { limit });
        return formatResponse(result, format, 'products');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Collects
  // ===========================================================================
  server.tool(
    'shopify_list_collects',
    `List product-collection relationships (collects).

Collects link products to custom collections.

Args:
  - limit: Number of collects to return
  - productId: Filter by product ID
  - collectionId: Filter by collection ID
  - format: Response format

Returns:
  List of collect relationships.`,
    {
      limit: z.number().int().min(1).max(250).default(50).optional(),
      productId: z.string().optional(),
      collectionId: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listCollects(params);
        return formatResponse(result, format, 'collects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Collect
  // ===========================================================================
  server.tool(
    'shopify_create_collect',
    `Add a product to a custom collection.

Args:
  - productId: Product ID to add
  - collectionId: Collection ID to add to
  - position: Position in collection (optional)

Returns:
  The created collect relationship.`,
    {
      productId: z.number().describe('Product ID'),
      collectionId: z.number().describe('Collection ID'),
      position: z.number().optional().describe('Position in collection'),
    },
    async (input) => {
      try {
        const collect = await client.createCollect(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: 'Product added to collection', collect },
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
  // Delete Collect
  // ===========================================================================
  server.tool(
    'shopify_delete_collect',
    `Remove a product from a custom collection.

Args:
  - collectId: Collect ID to delete

Returns:
  Confirmation of deletion.`,
    {
      collectId: z.number().describe('Collect ID'),
    },
    async ({ collectId }) => {
      try {
        await client.deleteCollect(collectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Collect ${collectId} deleted (product removed from collection)`,
                },
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
