/**
 * Theme and Asset Tools
 *
 * MCP tools for theme and theme asset management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ShopifyClient } from '../client.js';
import { formatError, formatResponse, formatThemesAsMarkdown } from '../utils/formatters.js';

/**
 * Register theme-related tools
 */
export function registerThemeTools(server: McpServer, client: ShopifyClient): void {
  // ===========================================================================
  // List Themes
  // ===========================================================================
  server.tool(
    'shopify_list_themes',
    `List all themes in the store.

Returns themes with their roles (main, unpublished, demo).

Args:
  - format: Response format

Returns:
  List of themes.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const themes = await client.listThemes();
        if (format === 'markdown') {
          return {
            content: [{ type: 'text', text: formatThemesAsMarkdown(themes) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(themes, null, 2) }],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Theme
  // ===========================================================================
  server.tool(
    'shopify_get_theme',
    `Get a single theme by ID.

Args:
  - themeId: Theme ID
  - format: Response format

Returns:
  The theme details.`,
    {
      themeId: z.number().describe('Theme ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ themeId, format }) => {
      try {
        const theme = await client.getTheme(themeId);
        return formatResponse(theme, format, 'theme');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Theme
  // ===========================================================================
  server.tool(
    'shopify_create_theme',
    `Create a new theme.

Args:
  - name: Theme name (required)
  - src: URL to a ZIP file containing the theme (optional)
  - role: Theme role (main, unpublished)

Returns:
  The created theme.`,
    {
      name: z.string().describe('Theme name'),
      src: z.string().url().optional().describe('URL to theme ZIP file'),
      role: z.enum(['main', 'unpublished']).optional(),
    },
    async (input) => {
      try {
        const theme = await client.createTheme(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Theme created', theme }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Theme
  // ===========================================================================
  server.tool(
    'shopify_update_theme',
    `Update an existing theme.

Args:
  - themeId: Theme ID to update
  - name: New theme name
  - role: New theme role (main to publish, unpublished to unpublish)

Returns:
  The updated theme.`,
    {
      themeId: z.number().describe('Theme ID'),
      name: z.string().optional(),
      role: z.enum(['main', 'unpublished']).optional(),
    },
    async ({ themeId, ...input }) => {
      try {
        const theme = await client.updateTheme(themeId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Theme updated', theme }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Theme
  // ===========================================================================
  server.tool(
    'shopify_delete_theme',
    `Delete a theme.

Note: The main (published) theme cannot be deleted.

Args:
  - themeId: Theme ID to delete

Returns:
  Confirmation of deletion.`,
    {
      themeId: z.number().describe('Theme ID'),
    },
    async ({ themeId }) => {
      try {
        await client.deleteTheme(themeId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Theme ${themeId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Assets
  // ===========================================================================
  server.tool(
    'shopify_list_assets',
    `List all assets in a theme.

Returns a list of asset keys (file paths) in the theme.

Args:
  - themeId: Theme ID
  - format: Response format

Returns:
  List of asset keys.`,
    {
      themeId: z.number().describe('Theme ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ themeId, format }) => {
      try {
        const assets = await client.listAssets(themeId);
        return formatResponse(
          { items: assets, count: assets.length, hasMore: false },
          format,
          'assets'
        );
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Asset
  // ===========================================================================
  server.tool(
    'shopify_get_asset',
    `Get a single asset from a theme.

Returns the asset content (value) and metadata.

Args:
  - themeId: Theme ID
  - key: Asset key (file path, e.g., "templates/index.liquid")
  - format: Response format

Returns:
  The asset with its content.`,
    {
      themeId: z.number().describe('Theme ID'),
      key: z.string().describe('Asset key (file path)'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ themeId, key, format }) => {
      try {
        const asset = await client.getAsset(themeId, key);
        return formatResponse(asset, format, 'asset');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create or Update Asset
  // ===========================================================================
  server.tool(
    'shopify_create_or_update_asset',
    `Create or update a theme asset.

Use value for text content or attachment for binary content.

Args:
  - themeId: Theme ID
  - key: Asset key (file path, e.g., "templates/custom.liquid")
  - value: Asset content as text
  - attachment: Asset content as base64-encoded string
  - sourceKey: Copy from another asset key (instead of value/attachment)

Returns:
  The created/updated asset.`,
    {
      themeId: z.number().describe('Theme ID'),
      key: z.string().describe('Asset key (file path)'),
      value: z.string().optional().describe('Text content'),
      attachment: z.string().optional().describe('Base64-encoded binary content'),
      sourceKey: z.string().optional().describe('Copy from this asset key'),
    },
    async ({ themeId, ...input }) => {
      try {
        const asset = await client.createOrUpdateAsset(themeId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Asset saved', asset }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Asset
  // ===========================================================================
  server.tool(
    'shopify_delete_asset',
    `Delete an asset from a theme.

Args:
  - themeId: Theme ID
  - key: Asset key to delete

Returns:
  Confirmation of deletion.`,
    {
      themeId: z.number().describe('Theme ID'),
      key: z.string().describe('Asset key'),
    },
    async ({ themeId, key }) => {
      try {
        await client.deleteAsset(themeId, key);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Asset ${key} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
