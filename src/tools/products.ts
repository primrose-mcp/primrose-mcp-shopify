/**
 * Product Tools
 *
 * MCP tools for product, variant, and image management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register product-related tools
 */
export function registerProductTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Products
  // ===========================================================================
  server.tool(
    'shopify_list_products',
    `List products from the Shopify store with pagination and filters.

Args:
  - limit: Number of products to return (1-250, default: 50)
  - sinceId: Return products after this ID
  - title: Filter by title
  - vendor: Filter by vendor
  - handle: Filter by handle
  - productType: Filter by product type
  - collectionId: Filter by collection
  - status: Filter by status (active, archived, draft)
  - publishedStatus: Filter by published status
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of products with variants.`,
    {
      limit: z.number().int().min(1).max(250).default(50).describe('Number of products to return'),
      sinceId: z.string().optional().describe('Return products after this ID'),
      title: z.string().optional().describe('Filter by title'),
      vendor: z.string().optional().describe('Filter by vendor'),
      handle: z.string().optional().describe('Filter by handle'),
      productType: z.string().optional().describe('Filter by product type'),
      collectionId: z.string().optional().describe('Filter by collection ID'),
      status: z.enum(['active', 'archived', 'draft']).optional().describe('Filter by status'),
      publishedStatus: z
        .enum(['published', 'unpublished', 'any'])
        .optional()
        .describe('Filter by published status'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ format, ...params }) => {
      try {
        const result = await client.listProducts(params);
        return formatResponse(result, format, 'products');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Product
  // ===========================================================================
  server.tool(
    'shopify_get_product',
    `Get a single product by ID.

Args:
  - productId: The product ID
  - format: Response format ('json' or 'markdown')

Returns:
  The product with all variants and images.`,
    {
      productId: z.number().describe('Product ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ productId, format }) => {
      try {
        const product = await client.getProduct(productId);
        return formatResponse(product, format, 'product');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Product
  // ===========================================================================
  server.tool(
    'shopify_create_product',
    `Create a new product in the store.

Args:
  - title: Product title (required)
  - bodyHtml: Product description in HTML
  - vendor: Product vendor
  - productType: Product type
  - tags: Comma-separated tags
  - status: Product status (active, archived, draft)
  - variants: Array of variant objects with price, sku, etc.
  - options: Array of option objects (name, values)
  - images: Array of image objects (src, alt)

Returns:
  The created product.`,
    {
      title: z.string().describe('Product title (required)'),
      bodyHtml: z.string().optional().describe('Product description in HTML'),
      vendor: z.string().optional().describe('Product vendor'),
      productType: z.string().optional().describe('Product type'),
      tags: z.string().optional().describe('Comma-separated tags'),
      status: z.enum(['active', 'archived', 'draft']).optional().describe('Product status'),
      variants: z
        .array(
          z.object({
            title: z.string().optional(),
            price: z.string().optional(),
            sku: z.string().optional(),
            inventoryQuantity: z.number().optional(),
            option1: z.string().optional(),
            option2: z.string().optional(),
            option3: z.string().optional(),
          })
        )
        .optional()
        .describe('Product variants'),
      options: z
        .array(z.object({ name: z.string(), values: z.array(z.string()) }))
        .optional()
        .describe('Product options'),
      images: z
        .array(z.object({ src: z.string(), alt: z.string().optional() }))
        .optional()
        .describe('Product images'),
    },
    async (input) => {
      try {
        const product = await client.createProduct(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Product created', product }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Product
  // ===========================================================================
  server.tool(
    'shopify_update_product',
    `Update an existing product.

Args:
  - productId: Product ID to update
  - title: New product title
  - bodyHtml: New product description
  - vendor: New vendor
  - productType: New product type
  - tags: New comma-separated tags
  - status: New status

Returns:
  The updated product.`,
    {
      productId: z.number().describe('Product ID to update'),
      title: z.string().optional(),
      bodyHtml: z.string().optional(),
      vendor: z.string().optional(),
      productType: z.string().optional(),
      tags: z.string().optional(),
      status: z.enum(['active', 'archived', 'draft']).optional(),
    },
    async ({ productId, ...input }) => {
      try {
        const product = await client.updateProduct(productId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Product updated', product }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Product
  // ===========================================================================
  server.tool(
    'shopify_delete_product',
    `Delete a product from the store.

Args:
  - productId: Product ID to delete

Returns:
  Confirmation of deletion.`,
    {
      productId: z.number().describe('Product ID to delete'),
    },
    async ({ productId }) => {
      try {
        await client.deleteProduct(productId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Product ${productId} deleted` },
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
  // Get Product Count
  // ===========================================================================
  server.tool(
    'shopify_get_product_count',
    `Get the count of products matching filters.

Args:
  - vendor: Filter by vendor
  - productType: Filter by product type
  - collectionId: Filter by collection
  - status: Filter by status

Returns:
  Count of matching products.`,
    {
      vendor: z.string().optional(),
      productType: z.string().optional(),
      collectionId: z.string().optional(),
      status: z.enum(['active', 'archived', 'draft']).optional(),
    },
    async (params) => {
      try {
        const count = await client.getProductCount(params);
        return {
          content: [{ type: 'text', text: JSON.stringify({ count }, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Product Variants
  // ===========================================================================
  server.tool(
    'shopify_list_product_variants',
    `List all variants for a product.

Args:
  - productId: Product ID
  - limit: Number of variants to return
  - format: Response format

Returns:
  List of product variants.`,
    {
      productId: z.number().describe('Product ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ productId, limit, format }) => {
      try {
        const result = await client.listProductVariants(productId, { limit });
        return formatResponse(result, format, 'variants');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Variant
  // ===========================================================================
  server.tool(
    'shopify_get_variant',
    `Get a single product variant by ID.

Args:
  - variantId: Variant ID
  - format: Response format

Returns:
  The variant details.`,
    {
      variantId: z.number().describe('Variant ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ variantId, format }) => {
      try {
        const variant = await client.getVariant(variantId);
        return formatResponse(variant, format, 'variant');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Variant
  // ===========================================================================
  server.tool(
    'shopify_create_variant',
    `Create a new variant for a product.

Args:
  - productId: Product ID
  - price: Variant price
  - sku: SKU code
  - option1: First option value
  - option2: Second option value
  - option3: Third option value
  - barcode: Barcode
  - weight: Weight
  - weightUnit: Weight unit (g, kg, lb, oz)
  - inventoryQuantity: Initial inventory quantity

Returns:
  The created variant.`,
    {
      productId: z.number().describe('Product ID'),
      price: z.string().optional(),
      sku: z.string().optional(),
      option1: z.string().optional(),
      option2: z.string().optional(),
      option3: z.string().optional(),
      barcode: z.string().optional(),
      weight: z.number().optional(),
      weightUnit: z.enum(['g', 'kg', 'lb', 'oz']).optional(),
      inventoryQuantity: z.number().optional(),
    },
    async ({ productId, ...input }) => {
      try {
        const variant = await client.createVariant(productId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Variant created', variant }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Variant
  // ===========================================================================
  server.tool(
    'shopify_update_variant',
    `Update an existing variant.

Args:
  - variantId: Variant ID to update
  - price: New price
  - sku: New SKU
  - option1/2/3: New option values
  - barcode: New barcode
  - weight: New weight
  - compareAtPrice: Compare at price

Returns:
  The updated variant.`,
    {
      variantId: z.number().describe('Variant ID'),
      price: z.string().optional(),
      sku: z.string().optional(),
      option1: z.string().optional(),
      option2: z.string().optional(),
      option3: z.string().optional(),
      barcode: z.string().optional(),
      weight: z.number().optional(),
      compareAtPrice: z.string().optional(),
    },
    async ({ variantId, ...input }) => {
      try {
        const variant = await client.updateVariant(variantId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Variant updated', variant }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Variant
  // ===========================================================================
  server.tool(
    'shopify_delete_variant',
    `Delete a product variant.

Args:
  - productId: Product ID
  - variantId: Variant ID to delete

Returns:
  Confirmation of deletion.`,
    {
      productId: z.number().describe('Product ID'),
      variantId: z.number().describe('Variant ID'),
    },
    async ({ productId, variantId }) => {
      try {
        await client.deleteVariant(productId, variantId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { success: true, message: `Variant ${variantId} deleted` },
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
  // List Product Images
  // ===========================================================================
  server.tool(
    'shopify_list_product_images',
    `List all images for a product.

Args:
  - productId: Product ID
  - limit: Number of images to return
  - format: Response format

Returns:
  List of product images.`,
    {
      productId: z.number().describe('Product ID'),
      limit: z.number().int().min(1).max(250).default(50).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ productId, limit, format }) => {
      try {
        const result = await client.listProductImages(productId, { limit });
        return formatResponse(result, format, 'images');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Product Image
  // ===========================================================================
  server.tool(
    'shopify_create_product_image',
    `Create a new image for a product.

Args:
  - productId: Product ID
  - src: Image URL (required unless using attachment)
  - attachment: Base64-encoded image data
  - alt: Alt text for the image
  - position: Position in the image list
  - variantIds: Array of variant IDs to associate

Returns:
  The created image.`,
    {
      productId: z.number().describe('Product ID'),
      src: z.string().optional().describe('Image URL'),
      attachment: z.string().optional().describe('Base64-encoded image'),
      alt: z.string().optional().describe('Alt text'),
      position: z.number().optional().describe('Position'),
      variantIds: z.array(z.number()).optional().describe('Variant IDs to associate'),
    },
    async ({ productId, ...input }) => {
      try {
        const image = await client.createProductImage(productId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image created', image }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Product Image
  // ===========================================================================
  server.tool(
    'shopify_update_product_image',
    `Update an existing product image.

Args:
  - productId: Product ID
  - imageId: Image ID
  - alt: New alt text
  - position: New position
  - variantIds: New variant IDs to associate

Returns:
  The updated image.`,
    {
      productId: z.number().describe('Product ID'),
      imageId: z.number().describe('Image ID'),
      alt: z.string().optional(),
      position: z.number().optional(),
      variantIds: z.array(z.number()).optional(),
    },
    async ({ productId, imageId, ...input }) => {
      try {
        const image = await client.updateProductImage(productId, imageId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image updated', image }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Product Image
  // ===========================================================================
  server.tool(
    'shopify_delete_product_image',
    `Delete a product image.

Args:
  - productId: Product ID
  - imageId: Image ID to delete

Returns:
  Confirmation of deletion.`,
    {
      productId: z.number().describe('Product ID'),
      imageId: z.number().describe('Image ID'),
    },
    async ({ productId, imageId }) => {
      try {
        await client.deleteProductImage(productId, imageId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Image ${imageId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
