# Shopify MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/shopify)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

A Model Context Protocol (MCP) server for Shopify, enabling e-commerce store management, product catalog operations, and order processing.

## Features

- **Collections** - Product collection management
- **Customers** - Customer account management
- **Discounts** - Discount codes and automatic discounts
- **Draft Orders** - Draft order creation and management
- **Fulfillments** - Order fulfillment operations
- **Inventory** - Inventory level management
- **Metafields** - Custom metafield data
- **Orders** - Order processing and management
- **Products** - Product catalog management
- **Shop** - Store information and settings
- **Themes** - Theme management and customization
- **Transactions** - Payment transaction records
- **Webhooks** - Webhook subscription management

## Quick Start

### Recommended: Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const client = new PrimroseMCP({
  server: 'shopify',
  credentials: {
    accessToken: 'shpat_your-access-token',
    shopDomain: 'your-store.myshopify.com'
  }
});
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Shopify-Access-Token` | Shopify Admin API access token |
| `X-Shopify-Shop-Domain` | Shop domain (e.g., mystore.myshopify.com) |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Shopify-API-Version` | API version (defaults to 2024-01) |

## Available Tools

### Products
- `shopify_list_products` - List all products
- `shopify_get_product` - Get product details
- `shopify_create_product` - Create a new product
- `shopify_update_product` - Update product
- `shopify_delete_product` - Delete product
- `shopify_list_product_variants` - List product variants
- `shopify_create_product_variant` - Create variant

### Collections
- `shopify_list_collections` - List collections
- `shopify_get_collection` - Get collection details
- `shopify_create_collection` - Create collection
- `shopify_update_collection` - Update collection
- `shopify_add_products_to_collection` - Add products

### Customers
- `shopify_list_customers` - List customers
- `shopify_get_customer` - Get customer details
- `shopify_create_customer` - Create customer
- `shopify_update_customer` - Update customer
- `shopify_search_customers` - Search customers

### Orders
- `shopify_list_orders` - List orders
- `shopify_get_order` - Get order details
- `shopify_create_order` - Create an order
- `shopify_update_order` - Update order
- `shopify_cancel_order` - Cancel order
- `shopify_close_order` - Close order

### Draft Orders
- `shopify_list_draft_orders` - List draft orders
- `shopify_get_draft_order` - Get draft order details
- `shopify_create_draft_order` - Create draft order
- `shopify_update_draft_order` - Update draft order
- `shopify_complete_draft_order` - Complete draft order

### Inventory
- `shopify_list_inventory_levels` - List inventory levels
- `shopify_adjust_inventory` - Adjust inventory level
- `shopify_set_inventory` - Set inventory level
- `shopify_list_locations` - List locations

### Fulfillments
- `shopify_list_fulfillments` - List fulfillments
- `shopify_create_fulfillment` - Create fulfillment
- `shopify_update_fulfillment_tracking` - Update tracking
- `shopify_cancel_fulfillment` - Cancel fulfillment

### Discounts
- `shopify_list_price_rules` - List price rules
- `shopify_create_price_rule` - Create price rule
- `shopify_create_discount_code` - Create discount code
- `shopify_list_discount_codes` - List discount codes

### Metafields
- `shopify_list_metafields` - List metafields
- `shopify_get_metafield` - Get metafield
- `shopify_create_metafield` - Create metafield
- `shopify_update_metafield` - Update metafield

### Shop
- `shopify_get_shop` - Get shop information
- `shopify_list_countries` - List shipping countries
- `shopify_list_currencies` - List currencies

### Webhooks
- `shopify_list_webhooks` - List webhooks
- `shopify_create_webhook` - Create webhook
- `shopify_delete_webhook` - Delete webhook

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type checking
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin-rest)
- [Shopify Developer Portal](https://shopify.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
