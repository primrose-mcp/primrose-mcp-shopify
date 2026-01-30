/**
 * Shopify MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (access tokens, shop domains) are parsed from request headers,
 * allowing a single server deployment to serve multiple Shopify stores.
 *
 * Required Headers:
 * - X-Shopify-Access-Token: Shopify Admin API access token
 * - X-Shopify-Shop-Domain: Shop domain (e.g., mystore.myshopify.com)
 *
 * Optional Headers:
 * - X-Shopify-API-Version: API version (defaults to 2024-01)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createShopifyClient } from './client.js';
import {
  registerCollectionTools,
  registerCustomerTools,
  registerDiscountTools,
  registerDraftOrderTools,
  registerFulfillmentTools,
  registerInventoryTools,
  registerMetafieldTools,
  registerOrderTools,
  registerProductTools,
  registerShopTools,
  registerThemeTools,
  registerTransactionTools,
  registerWebhookTools,
} from './tools/index.js';
import {
  type Env,
  parseTenantCredentials,
  type TenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'shopify-mcp-server';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * Use this when you need:
 * - Session state persistence
 * - Per-user rate limiting
 * - Cached API responses
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class ShopifyMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    // NOTE: Stateful mode requires credentials to be configured differently.
    // For multi-tenant, use the stateless endpoint at /mcp instead.
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Shopify-Access-Token and X-Shopify-Shop-Domain headers instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple Shopify stores.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createShopifyClient(credentials);

  // Register all Shopify tools
  registerShopTools(server, client);
  registerProductTools(server, client);
  registerCollectionTools(server, client);
  registerOrderTools(server, client);
  registerCustomerTools(server, client);
  registerInventoryTools(server, client);
  registerFulfillmentTools(server, client);
  registerDraftOrderTools(server, client);
  registerTransactionTools(server, client);
  registerDiscountTools(server, client);
  registerWebhookTools(server, client);
  registerThemeTools(server, client);
  registerMetafieldTools(server, client);

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Option 1: Stateful MCP with McpAgent (requires Durable Objects)
    // ==========================================================================
    // Uncomment to use McpAgent for stateful sessions:
    //
    // if (url.pathname === '/sse' || url.pathname === '/mcp') {
    //   return ShopifyMcpAgent.serveSSE('/sse').fetch(request, env, ctx);
    // }

    // ==========================================================================
    // Option 2: Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Shopify-Access-Token', 'X-Shopify-Shop-Domain'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      // This is the recommended approach for stateless MCP servers
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      // For SSE, we need to use McpAgent with serveSSE
      // Enable Durable Objects in wrangler.jsonc to use this
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Shopify MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Shopify-Access-Token': 'Shopify Admin API access token',
            'X-Shopify-Shop-Domain': 'Shop domain (e.g., mystore.myshopify.com)',
          },
          optional_headers: {
            'X-Shopify-API-Version': 'API version (defaults to 2024-01)',
          },
        },
        available_tools: [
          // Shop
          'shopify_test_connection',
          'shopify_get_shop',
          // Products
          'shopify_list_products',
          'shopify_get_product',
          'shopify_create_product',
          'shopify_update_product',
          'shopify_delete_product',
          'shopify_get_product_count',
          'shopify_list_product_variants',
          'shopify_get_variant',
          'shopify_create_variant',
          'shopify_update_variant',
          'shopify_delete_variant',
          'shopify_list_product_images',
          'shopify_create_product_image',
          'shopify_update_product_image',
          'shopify_delete_product_image',
          // Collections
          'shopify_list_custom_collections',
          'shopify_get_custom_collection',
          'shopify_create_custom_collection',
          'shopify_update_custom_collection',
          'shopify_delete_custom_collection',
          'shopify_list_smart_collections',
          'shopify_get_smart_collection',
          'shopify_create_smart_collection',
          'shopify_update_smart_collection',
          'shopify_delete_smart_collection',
          'shopify_get_collection',
          'shopify_list_collection_products',
          'shopify_list_collects',
          'shopify_create_collect',
          'shopify_delete_collect',
          // Orders
          'shopify_list_orders',
          'shopify_get_order',
          'shopify_create_order',
          'shopify_update_order',
          'shopify_delete_order',
          'shopify_get_order_count',
          'shopify_close_order',
          'shopify_open_order',
          'shopify_cancel_order',
          // Customers
          'shopify_list_customers',
          'shopify_get_customer',
          'shopify_create_customer',
          'shopify_update_customer',
          'shopify_delete_customer',
          'shopify_get_customer_count',
          'shopify_search_customers',
          'shopify_get_customer_orders',
          // Inventory
          'shopify_list_locations',
          'shopify_get_location',
          'shopify_get_location_count',
          'shopify_list_inventory_levels',
          'shopify_adjust_inventory_level',
          'shopify_set_inventory_level',
          'shopify_get_inventory_item',
          'shopify_update_inventory_item',
          // Fulfillments
          'shopify_list_fulfillments',
          'shopify_get_fulfillment',
          'shopify_create_fulfillment',
          'shopify_update_fulfillment_tracking',
          'shopify_cancel_fulfillment',
          'shopify_list_fulfillment_orders',
          'shopify_get_fulfillment_order',
          // Draft Orders
          'shopify_list_draft_orders',
          'shopify_get_draft_order',
          'shopify_create_draft_order',
          'shopify_update_draft_order',
          'shopify_delete_draft_order',
          'shopify_complete_draft_order',
          'shopify_send_draft_order_invoice',
          // Transactions & Refunds
          'shopify_list_transactions',
          'shopify_get_transaction',
          'shopify_create_transaction',
          'shopify_list_refunds',
          'shopify_get_refund',
          'shopify_calculate_refund',
          'shopify_create_refund',
          // Discounts
          'shopify_list_price_rules',
          'shopify_get_price_rule',
          'shopify_create_price_rule',
          'shopify_update_price_rule',
          'shopify_delete_price_rule',
          'shopify_list_discount_codes',
          'shopify_get_discount_code',
          'shopify_create_discount_code',
          'shopify_update_discount_code',
          'shopify_delete_discount_code',
          // Webhooks
          'shopify_list_webhooks',
          'shopify_get_webhook',
          'shopify_create_webhook',
          'shopify_update_webhook',
          'shopify_delete_webhook',
          'shopify_get_webhook_count',
          // Themes & Assets
          'shopify_list_themes',
          'shopify_get_theme',
          'shopify_create_theme',
          'shopify_update_theme',
          'shopify_delete_theme',
          'shopify_list_assets',
          'shopify_get_asset',
          'shopify_create_or_update_asset',
          'shopify_delete_asset',
          // Metafields
          'shopify_list_metafields',
          'shopify_get_metafield',
          'shopify_create_metafield',
          'shopify_update_metafield',
          'shopify_delete_metafield',
          'shopify_list_shop_metafields',
          'shopify_create_shop_metafield',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
