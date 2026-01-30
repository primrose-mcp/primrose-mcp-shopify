/**
 * Shopify Admin REST API Client
 *
 * This file handles all HTTP communication with the Shopify Admin REST API.
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple Shopify stores.
 */

import type {
  Asset,
  AssetCreateInput,
  Collect,
  CollectCreateInput,
  Collection,
  CollectionCreateInput,
  CollectionListParams,
  CollectionUpdateInput,
  CollectListParams,
  CustomCollection,
  Customer,
  CustomerCreateInput,
  CustomerListParams,
  CustomerSearchParams,
  CustomerUpdateInput,
  DiscountCodeCreateInput,
  DiscountCodeEntity,
  DraftOrder,
  DraftOrderCreateInput,
  DraftOrderListParams,
  DraftOrderUpdateInput,
  Fulfillment,
  FulfillmentCreateInput,
  FulfillmentOrder,
  FulfillmentUpdateTrackingInput,
  InventoryItem,
  InventoryLevel,
  InventoryLevelParams,
  Location,
  Metafield,
  MetafieldCreateInput,
  MetafieldListParams,
  MetafieldUpdateInput,
  Order,
  OrderCreateInput,
  OrderListParams,
  OrderUpdateInput,
  PaginatedResponse,
  PriceRule,
  PriceRuleCreateInput,
  PriceRuleListParams,
  PriceRuleUpdateInput,
  Product,
  ProductCreateInput,
  ProductImage,
  ProductListParams,
  ProductUpdateInput,
  ProductVariant,
  Refund,
  RefundCalculateInput,
  RefundCreateInput,
  Shop,
  SmartCollection,
  SmartCollectionCreateInput,
  SmartCollectionRule,
  Theme,
  ThemeCreateInput,
  ThemeUpdateInput,
  Transaction,
  TransactionCreateInput,
  Webhook,
  WebhookCreateInput,
  WebhookListParams,
  WebhookUpdateInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, CrmApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Shopify Client Interface
// =============================================================================

export interface ShopifyClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string; shopName?: string }>;

  // Shop
  getShop(): Promise<Shop>;

  // Products
  listProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>>;
  getProduct(productId: number): Promise<Product>;
  createProduct(input: ProductCreateInput): Promise<Product>;
  updateProduct(productId: number, input: ProductUpdateInput): Promise<Product>;
  deleteProduct(productId: number): Promise<void>;
  getProductCount(params?: ProductListParams): Promise<number>;

  // Product Variants
  listProductVariants(
    productId: number,
    params?: { limit?: number; sinceId?: string }
  ): Promise<PaginatedResponse<ProductVariant>>;
  getVariant(variantId: number): Promise<ProductVariant>;
  createVariant(productId: number, input: Partial<ProductVariant>): Promise<ProductVariant>;
  updateVariant(variantId: number, input: Partial<ProductVariant>): Promise<ProductVariant>;
  deleteVariant(productId: number, variantId: number): Promise<void>;

  // Product Images
  listProductImages(
    productId: number,
    params?: { limit?: number; sinceId?: string }
  ): Promise<PaginatedResponse<ProductImage>>;
  getProductImage(productId: number, imageId: number): Promise<ProductImage>;
  createProductImage(productId: number, input: Partial<ProductImage>): Promise<ProductImage>;
  updateProductImage(
    productId: number,
    imageId: number,
    input: Partial<ProductImage>
  ): Promise<ProductImage>;
  deleteProductImage(productId: number, imageId: number): Promise<void>;

  // Collections (Custom)
  listCustomCollections(
    params?: CollectionListParams
  ): Promise<PaginatedResponse<CustomCollection>>;
  getCustomCollection(collectionId: number): Promise<CustomCollection>;
  createCustomCollection(input: CollectionCreateInput): Promise<CustomCollection>;
  updateCustomCollection(
    collectionId: number,
    input: CollectionUpdateInput
  ): Promise<CustomCollection>;
  deleteCustomCollection(collectionId: number): Promise<void>;

  // Collections (Smart)
  listSmartCollections(params?: CollectionListParams): Promise<PaginatedResponse<SmartCollection>>;
  getSmartCollection(collectionId: number): Promise<SmartCollection>;
  createSmartCollection(input: SmartCollectionCreateInput): Promise<SmartCollection>;
  updateSmartCollection(
    collectionId: number,
    input: CollectionUpdateInput & { rules?: SmartCollectionRule[] }
  ): Promise<SmartCollection>;
  deleteSmartCollection(collectionId: number): Promise<void>;

  // Collection Products
  getCollection(collectionId: number): Promise<Collection>;
  listCollectionProducts(
    collectionId: number,
    params?: { limit?: number }
  ): Promise<PaginatedResponse<Product>>;

  // Collects (Product-Collection relationships)
  listCollects(params?: CollectListParams): Promise<PaginatedResponse<Collect>>;
  createCollect(input: CollectCreateInput): Promise<Collect>;
  deleteCollect(collectId: number): Promise<void>;

  // Orders
  listOrders(params?: OrderListParams): Promise<PaginatedResponse<Order>>;
  getOrder(orderId: number): Promise<Order>;
  createOrder(input: OrderCreateInput): Promise<Order>;
  updateOrder(orderId: number, input: OrderUpdateInput): Promise<Order>;
  deleteOrder(orderId: number): Promise<void>;
  getOrderCount(params?: OrderListParams): Promise<number>;
  closeOrder(orderId: number): Promise<Order>;
  openOrder(orderId: number): Promise<Order>;
  cancelOrder(
    orderId: number,
    params?: { reason?: string; email?: boolean; restock?: boolean }
  ): Promise<Order>;

  // Customers
  listCustomers(params?: CustomerListParams): Promise<PaginatedResponse<Customer>>;
  getCustomer(customerId: number): Promise<Customer>;
  createCustomer(input: CustomerCreateInput): Promise<Customer>;
  updateCustomer(customerId: number, input: CustomerUpdateInput): Promise<Customer>;
  deleteCustomer(customerId: number): Promise<void>;
  getCustomerCount(params?: CustomerListParams): Promise<number>;
  searchCustomers(params: CustomerSearchParams): Promise<PaginatedResponse<Customer>>;
  getCustomerOrders(
    customerId: number,
    params?: { limit?: number; status?: string }
  ): Promise<PaginatedResponse<Order>>;

  // Inventory
  listLocations(params?: { limit?: number }): Promise<PaginatedResponse<Location>>;
  getLocation(locationId: number): Promise<Location>;
  getLocationCount(): Promise<number>;
  listInventoryLevels(params: InventoryLevelParams): Promise<InventoryLevel[]>;
  adjustInventoryLevel(
    inventoryItemId: number,
    locationId: number,
    adjustment: number
  ): Promise<InventoryLevel>;
  setInventoryLevel(
    inventoryItemId: number,
    locationId: number,
    available: number
  ): Promise<InventoryLevel>;
  getInventoryItem(inventoryItemId: number): Promise<InventoryItem>;
  updateInventoryItem(
    inventoryItemId: number,
    input: Partial<InventoryItem>
  ): Promise<InventoryItem>;

  // Fulfillments
  listFulfillments(
    orderId: number,
    params?: { limit?: number }
  ): Promise<PaginatedResponse<Fulfillment>>;
  getFulfillment(orderId: number, fulfillmentId: number): Promise<Fulfillment>;
  createFulfillment(input: FulfillmentCreateInput): Promise<Fulfillment>;
  updateFulfillmentTracking(
    fulfillmentId: number,
    input: FulfillmentUpdateTrackingInput
  ): Promise<Fulfillment>;
  cancelFulfillment(fulfillmentId: number): Promise<Fulfillment>;

  // Fulfillment Orders
  listFulfillmentOrders(orderId: number): Promise<FulfillmentOrder[]>;
  getFulfillmentOrder(fulfillmentOrderId: number): Promise<FulfillmentOrder>;

  // Draft Orders
  listDraftOrders(params?: DraftOrderListParams): Promise<PaginatedResponse<DraftOrder>>;
  getDraftOrder(draftOrderId: number): Promise<DraftOrder>;
  createDraftOrder(input: DraftOrderCreateInput): Promise<DraftOrder>;
  updateDraftOrder(draftOrderId: number, input: DraftOrderUpdateInput): Promise<DraftOrder>;
  deleteDraftOrder(draftOrderId: number): Promise<void>;
  completeDraftOrder(draftOrderId: number, paymentPending?: boolean): Promise<DraftOrder>;
  sendDraftOrderInvoice(
    draftOrderId: number,
    params?: { to?: string; from?: string; subject?: string; customMessage?: string }
  ): Promise<{ draftOrderInvoice: { to: string; from: string; subject: string } }>;

  // Transactions
  listTransactions(orderId: number): Promise<Transaction[]>;
  getTransaction(orderId: number, transactionId: number): Promise<Transaction>;
  createTransaction(orderId: number, input: TransactionCreateInput): Promise<Transaction>;

  // Refunds
  listRefunds(orderId: number): Promise<Refund[]>;
  getRefund(orderId: number, refundId: number): Promise<Refund>;
  createRefund(orderId: number, input: RefundCreateInput): Promise<Refund>;
  calculateRefund(orderId: number, input: RefundCalculateInput): Promise<Refund>;

  // Price Rules & Discount Codes
  listPriceRules(params?: PriceRuleListParams): Promise<PaginatedResponse<PriceRule>>;
  getPriceRule(priceRuleId: number): Promise<PriceRule>;
  createPriceRule(input: PriceRuleCreateInput): Promise<PriceRule>;
  updatePriceRule(priceRuleId: number, input: PriceRuleUpdateInput): Promise<PriceRule>;
  deletePriceRule(priceRuleId: number): Promise<void>;
  listDiscountCodes(priceRuleId: number): Promise<DiscountCodeEntity[]>;
  createDiscountCode(
    priceRuleId: number,
    input: DiscountCodeCreateInput
  ): Promise<DiscountCodeEntity>;
  getDiscountCode(priceRuleId: number, discountCodeId: number): Promise<DiscountCodeEntity>;
  updateDiscountCode(
    priceRuleId: number,
    discountCodeId: number,
    code: string
  ): Promise<DiscountCodeEntity>;
  deleteDiscountCode(priceRuleId: number, discountCodeId: number): Promise<void>;

  // Webhooks
  listWebhooks(params?: WebhookListParams): Promise<PaginatedResponse<Webhook>>;
  getWebhook(webhookId: number): Promise<Webhook>;
  createWebhook(input: WebhookCreateInput): Promise<Webhook>;
  updateWebhook(webhookId: number, input: WebhookUpdateInput): Promise<Webhook>;
  deleteWebhook(webhookId: number): Promise<void>;
  getWebhookCount(params?: WebhookListParams): Promise<number>;

  // Themes
  listThemes(): Promise<Theme[]>;
  getTheme(themeId: number): Promise<Theme>;
  createTheme(input: ThemeCreateInput): Promise<Theme>;
  updateTheme(themeId: number, input: ThemeUpdateInput): Promise<Theme>;
  deleteTheme(themeId: number): Promise<void>;

  // Theme Assets
  listAssets(themeId: number): Promise<Asset[]>;
  getAsset(themeId: number, key: string): Promise<Asset>;
  createOrUpdateAsset(themeId: number, input: AssetCreateInput): Promise<Asset>;
  deleteAsset(themeId: number, key: string): Promise<void>;

  // Metafields
  listMetafields(
    ownerResource: string,
    ownerId: number,
    params?: MetafieldListParams
  ): Promise<PaginatedResponse<Metafield>>;
  getMetafield(ownerResource: string, ownerId: number, metafieldId: number): Promise<Metafield>;
  createMetafield(
    ownerResource: string,
    ownerId: number,
    input: MetafieldCreateInput
  ): Promise<Metafield>;
  updateMetafield(
    ownerResource: string,
    ownerId: number,
    metafieldId: number,
    input: MetafieldUpdateInput
  ): Promise<Metafield>;
  deleteMetafield(ownerResource: string, ownerId: number, metafieldId: number): Promise<void>;
  listShopMetafields(params?: MetafieldListParams): Promise<PaginatedResponse<Metafield>>;
  createShopMetafield(input: MetafieldCreateInput): Promise<Metafield>;
}

// =============================================================================
// Helper: Convert snake_case to camelCase
// =============================================================================

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function transformKeys<T>(obj: unknown, transformer: (key: string) => string): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, transformer)) as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[transformer(key)] = transformKeys(value, transformer);
    }
    return result as T;
  }
  return obj as T;
}

function toCamelCase<T>(obj: unknown): T {
  return transformKeys<T>(obj, snakeToCamel);
}

function toSnakeCase<T>(obj: unknown): T {
  return transformKeys<T>(obj, camelToSnake);
}

// =============================================================================
// Shopify Client Implementation
// =============================================================================

class ShopifyClientImpl implements ShopifyClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  private getBaseUrl(): string {
    return `https://${this.credentials.shopDomain}/admin/api/${this.credentials.apiVersion}`;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'X-Shopify-Access-Token': this.credentials.accessToken,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthenticationError('Invalid access token');
    }

    if (response.status === 403) {
      throw new AuthenticationError('Access denied. Check your access scopes.');
    }

    // Handle not found
    if (response.status === 404) {
      throw new CrmApiError('Resource not found', 404);
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Shopify API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.errors) {
          if (typeof errorJson.errors === 'string') {
            message = errorJson.errors;
          } else {
            message = JSON.stringify(errorJson.errors);
          }
        }
      } catch {
        // Use default message
      }
      throw new CrmApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return toCamelCase<T>(data);
  }

  private buildQueryParams(params: Record<string, unknown>): string {
    const snakeParams = toSnakeCase<Record<string, unknown>>(params);
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(snakeParams)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.set(key, value.join(','));
        } else {
          queryParams.set(key, String(value));
        }
      }
    }
    return queryParams.toString();
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string; shopName?: string }> {
    try {
      const shop = await this.getShop();
      return {
        connected: true,
        message: `Connected to ${shop.name}`,
        shopName: shop.name,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Shop
  // ===========================================================================

  async getShop(): Promise<Shop> {
    const data = await this.request<{ shop: Shop }>('/shop.json');
    return data.shop;
  }

  // ===========================================================================
  // Products
  // ===========================================================================

  async listProducts(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ products: Product[] }>(
      `/products.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.products,
      count: data.products.length,
      hasMore: data.products.length === (params?.limit || 50),
    };
  }

  async getProduct(productId: number): Promise<Product> {
    const data = await this.request<{ product: Product }>(`/products/${productId}.json`);
    return data.product;
  }

  async createProduct(input: ProductCreateInput): Promise<Product> {
    const data = await this.request<{ product: Product }>('/products.json', {
      method: 'POST',
      body: JSON.stringify({ product: toSnakeCase(input) }),
    });
    return data.product;
  }

  async updateProduct(productId: number, input: ProductUpdateInput): Promise<Product> {
    const data = await this.request<{ product: Product }>(`/products/${productId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product: toSnakeCase(input) }),
    });
    return data.product;
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.request(`/products/${productId}.json`, { method: 'DELETE' });
  }

  async getProductCount(params?: ProductListParams): Promise<number> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ count: number }>(
      `/products/count.json${query ? `?${query}` : ''}`
    );
    return data.count;
  }

  // ===========================================================================
  // Product Variants
  // ===========================================================================

  async listProductVariants(
    productId: number,
    params?: { limit?: number; sinceId?: string }
  ): Promise<PaginatedResponse<ProductVariant>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ variants: ProductVariant[] }>(
      `/products/${productId}/variants.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.variants,
      count: data.variants.length,
      hasMore: data.variants.length === (params?.limit || 50),
    };
  }

  async getVariant(variantId: number): Promise<ProductVariant> {
    const data = await this.request<{ variant: ProductVariant }>(`/variants/${variantId}.json`);
    return data.variant;
  }

  async createVariant(productId: number, input: Partial<ProductVariant>): Promise<ProductVariant> {
    const data = await this.request<{ variant: ProductVariant }>(
      `/products/${productId}/variants.json`,
      {
        method: 'POST',
        body: JSON.stringify({ variant: toSnakeCase(input) }),
      }
    );
    return data.variant;
  }

  async updateVariant(variantId: number, input: Partial<ProductVariant>): Promise<ProductVariant> {
    const data = await this.request<{ variant: ProductVariant }>(`/variants/${variantId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ variant: toSnakeCase(input) }),
    });
    return data.variant;
  }

  async deleteVariant(productId: number, variantId: number): Promise<void> {
    await this.request(`/products/${productId}/variants/${variantId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Product Images
  // ===========================================================================

  async listProductImages(
    productId: number,
    params?: { limit?: number; sinceId?: string }
  ): Promise<PaginatedResponse<ProductImage>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ images: ProductImage[] }>(
      `/products/${productId}/images.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.images,
      count: data.images.length,
      hasMore: data.images.length === (params?.limit || 50),
    };
  }

  async getProductImage(productId: number, imageId: number): Promise<ProductImage> {
    const data = await this.request<{ image: ProductImage }>(
      `/products/${productId}/images/${imageId}.json`
    );
    return data.image;
  }

  async createProductImage(productId: number, input: Partial<ProductImage>): Promise<ProductImage> {
    const data = await this.request<{ image: ProductImage }>(`/products/${productId}/images.json`, {
      method: 'POST',
      body: JSON.stringify({ image: toSnakeCase(input) }),
    });
    return data.image;
  }

  async updateProductImage(
    productId: number,
    imageId: number,
    input: Partial<ProductImage>
  ): Promise<ProductImage> {
    const data = await this.request<{ image: ProductImage }>(
      `/products/${productId}/images/${imageId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ image: toSnakeCase(input) }),
      }
    );
    return data.image;
  }

  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    await this.request(`/products/${productId}/images/${imageId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Custom Collections
  // ===========================================================================

  async listCustomCollections(
    params?: CollectionListParams
  ): Promise<PaginatedResponse<CustomCollection>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ customCollections: CustomCollection[] }>(
      `/custom_collections.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.customCollections,
      count: data.customCollections.length,
      hasMore: data.customCollections.length === (params?.limit || 50),
    };
  }

  async getCustomCollection(collectionId: number): Promise<CustomCollection> {
    const data = await this.request<{ customCollection: CustomCollection }>(
      `/custom_collections/${collectionId}.json`
    );
    return data.customCollection;
  }

  async createCustomCollection(input: CollectionCreateInput): Promise<CustomCollection> {
    const data = await this.request<{ customCollection: CustomCollection }>(
      '/custom_collections.json',
      {
        method: 'POST',
        body: JSON.stringify({ customCollection: toSnakeCase(input) }),
      }
    );
    return data.customCollection;
  }

  async updateCustomCollection(
    collectionId: number,
    input: CollectionUpdateInput
  ): Promise<CustomCollection> {
    const data = await this.request<{ customCollection: CustomCollection }>(
      `/custom_collections/${collectionId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ customCollection: toSnakeCase(input) }),
      }
    );
    return data.customCollection;
  }

  async deleteCustomCollection(collectionId: number): Promise<void> {
    await this.request(`/custom_collections/${collectionId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Smart Collections
  // ===========================================================================

  async listSmartCollections(
    params?: CollectionListParams
  ): Promise<PaginatedResponse<SmartCollection>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ smartCollections: SmartCollection[] }>(
      `/smart_collections.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.smartCollections,
      count: data.smartCollections.length,
      hasMore: data.smartCollections.length === (params?.limit || 50),
    };
  }

  async getSmartCollection(collectionId: number): Promise<SmartCollection> {
    const data = await this.request<{ smartCollection: SmartCollection }>(
      `/smart_collections/${collectionId}.json`
    );
    return data.smartCollection;
  }

  async createSmartCollection(input: SmartCollectionCreateInput): Promise<SmartCollection> {
    const data = await this.request<{ smartCollection: SmartCollection }>(
      '/smart_collections.json',
      {
        method: 'POST',
        body: JSON.stringify({ smartCollection: toSnakeCase(input) }),
      }
    );
    return data.smartCollection;
  }

  async updateSmartCollection(
    collectionId: number,
    input: CollectionUpdateInput & { rules?: SmartCollectionRule[] }
  ): Promise<SmartCollection> {
    const data = await this.request<{ smartCollection: SmartCollection }>(
      `/smart_collections/${collectionId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ smartCollection: toSnakeCase(input) }),
      }
    );
    return data.smartCollection;
  }

  async deleteSmartCollection(collectionId: number): Promise<void> {
    await this.request(`/smart_collections/${collectionId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Collection (Generic)
  // ===========================================================================

  async getCollection(collectionId: number): Promise<Collection> {
    const data = await this.request<{ collection: Collection }>(
      `/collections/${collectionId}.json`
    );
    return data.collection;
  }

  async listCollectionProducts(
    collectionId: number,
    params?: { limit?: number }
  ): Promise<PaginatedResponse<Product>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ products: Product[] }>(
      `/collections/${collectionId}/products.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.products,
      count: data.products.length,
      hasMore: data.products.length === (params?.limit || 50),
    };
  }

  // ===========================================================================
  // Collects
  // ===========================================================================

  async listCollects(params?: CollectListParams): Promise<PaginatedResponse<Collect>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ collects: Collect[] }>(
      `/collects.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.collects,
      count: data.collects.length,
      hasMore: data.collects.length === (params?.limit || 50),
    };
  }

  async createCollect(input: CollectCreateInput): Promise<Collect> {
    const data = await this.request<{ collect: Collect }>('/collects.json', {
      method: 'POST',
      body: JSON.stringify({ collect: toSnakeCase(input) }),
    });
    return data.collect;
  }

  async deleteCollect(collectId: number): Promise<void> {
    await this.request(`/collects/${collectId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Orders
  // ===========================================================================

  async listOrders(params?: OrderListParams): Promise<PaginatedResponse<Order>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ orders: Order[] }>(`/orders.json${query ? `?${query}` : ''}`);
    return {
      items: data.orders,
      count: data.orders.length,
      hasMore: data.orders.length === (params?.limit || 50),
    };
  }

  async getOrder(orderId: number): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}.json`);
    return data.order;
  }

  async createOrder(input: OrderCreateInput): Promise<Order> {
    const data = await this.request<{ order: Order }>('/orders.json', {
      method: 'POST',
      body: JSON.stringify({ order: toSnakeCase(input) }),
    });
    return data.order;
  }

  async updateOrder(orderId: number, input: OrderUpdateInput): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ order: toSnakeCase(input) }),
    });
    return data.order;
  }

  async deleteOrder(orderId: number): Promise<void> {
    await this.request(`/orders/${orderId}.json`, { method: 'DELETE' });
  }

  async getOrderCount(params?: OrderListParams): Promise<number> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ count: number }>(
      `/orders/count.json${query ? `?${query}` : ''}`
    );
    return data.count;
  }

  async closeOrder(orderId: number): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}/close.json`, {
      method: 'POST',
    });
    return data.order;
  }

  async openOrder(orderId: number): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}/open.json`, {
      method: 'POST',
    });
    return data.order;
  }

  async cancelOrder(
    orderId: number,
    params?: { reason?: string; email?: boolean; restock?: boolean }
  ): Promise<Order> {
    const data = await this.request<{ order: Order }>(`/orders/${orderId}/cancel.json`, {
      method: 'POST',
      body: params ? JSON.stringify(toSnakeCase(params)) : undefined,
    });
    return data.order;
  }

  // ===========================================================================
  // Customers
  // ===========================================================================

  async listCustomers(params?: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ customers: Customer[] }>(
      `/customers.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.customers,
      count: data.customers.length,
      hasMore: data.customers.length === (params?.limit || 50),
    };
  }

  async getCustomer(customerId: number): Promise<Customer> {
    const data = await this.request<{ customer: Customer }>(`/customers/${customerId}.json`);
    return data.customer;
  }

  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    const data = await this.request<{ customer: Customer }>('/customers.json', {
      method: 'POST',
      body: JSON.stringify({ customer: toSnakeCase(input) }),
    });
    return data.customer;
  }

  async updateCustomer(customerId: number, input: CustomerUpdateInput): Promise<Customer> {
    const data = await this.request<{ customer: Customer }>(`/customers/${customerId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ customer: toSnakeCase(input) }),
    });
    return data.customer;
  }

  async deleteCustomer(customerId: number): Promise<void> {
    await this.request(`/customers/${customerId}.json`, { method: 'DELETE' });
  }

  async getCustomerCount(params?: CustomerListParams): Promise<number> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ count: number }>(
      `/customers/count.json${query ? `?${query}` : ''}`
    );
    return data.count;
  }

  async searchCustomers(params: CustomerSearchParams): Promise<PaginatedResponse<Customer>> {
    const query = this.buildQueryParams(params);
    const data = await this.request<{ customers: Customer[] }>(`/customers/search.json?${query}`);
    return {
      items: data.customers,
      count: data.customers.length,
      hasMore: data.customers.length === (params?.limit || 50),
    };
  }

  async getCustomerOrders(
    customerId: number,
    params?: { limit?: number; status?: string }
  ): Promise<PaginatedResponse<Order>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ orders: Order[] }>(
      `/customers/${customerId}/orders.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.orders,
      count: data.orders.length,
      hasMore: data.orders.length === (params?.limit || 50),
    };
  }

  // ===========================================================================
  // Inventory
  // ===========================================================================

  async listLocations(params?: { limit?: number }): Promise<PaginatedResponse<Location>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ locations: Location[] }>(
      `/locations.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.locations,
      count: data.locations.length,
      hasMore: data.locations.length === (params?.limit || 50),
    };
  }

  async getLocation(locationId: number): Promise<Location> {
    const data = await this.request<{ location: Location }>(`/locations/${locationId}.json`);
    return data.location;
  }

  async getLocationCount(): Promise<number> {
    const data = await this.request<{ count: number }>('/locations/count.json');
    return data.count;
  }

  async listInventoryLevels(params: InventoryLevelParams): Promise<InventoryLevel[]> {
    const query = this.buildQueryParams(params);
    const data = await this.request<{ inventoryLevels: InventoryLevel[] }>(
      `/inventory_levels.json?${query}`
    );
    return data.inventoryLevels;
  }

  async adjustInventoryLevel(
    inventoryItemId: number,
    locationId: number,
    adjustment: number
  ): Promise<InventoryLevel> {
    const data = await this.request<{ inventoryLevel: InventoryLevel }>(
      '/inventory_levels/adjust.json',
      {
        method: 'POST',
        body: JSON.stringify({
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          available_adjustment: adjustment,
        }),
      }
    );
    return data.inventoryLevel;
  }

  async setInventoryLevel(
    inventoryItemId: number,
    locationId: number,
    available: number
  ): Promise<InventoryLevel> {
    const data = await this.request<{ inventoryLevel: InventoryLevel }>(
      '/inventory_levels/set.json',
      {
        method: 'POST',
        body: JSON.stringify({
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          available,
        }),
      }
    );
    return data.inventoryLevel;
  }

  async getInventoryItem(inventoryItemId: number): Promise<InventoryItem> {
    const data = await this.request<{ inventoryItem: InventoryItem }>(
      `/inventory_items/${inventoryItemId}.json`
    );
    return data.inventoryItem;
  }

  async updateInventoryItem(
    inventoryItemId: number,
    input: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const data = await this.request<{ inventoryItem: InventoryItem }>(
      `/inventory_items/${inventoryItemId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ inventoryItem: toSnakeCase(input) }),
      }
    );
    return data.inventoryItem;
  }

  // ===========================================================================
  // Fulfillments
  // ===========================================================================

  async listFulfillments(
    orderId: number,
    params?: { limit?: number }
  ): Promise<PaginatedResponse<Fulfillment>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ fulfillments: Fulfillment[] }>(
      `/orders/${orderId}/fulfillments.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.fulfillments,
      count: data.fulfillments.length,
      hasMore: data.fulfillments.length === (params?.limit || 50),
    };
  }

  async getFulfillment(orderId: number, fulfillmentId: number): Promise<Fulfillment> {
    const data = await this.request<{ fulfillment: Fulfillment }>(
      `/orders/${orderId}/fulfillments/${fulfillmentId}.json`
    );
    return data.fulfillment;
  }

  async createFulfillment(input: FulfillmentCreateInput): Promise<Fulfillment> {
    const data = await this.request<{ fulfillment: Fulfillment }>('/fulfillments.json', {
      method: 'POST',
      body: JSON.stringify({ fulfillment: toSnakeCase(input) }),
    });
    return data.fulfillment;
  }

  async updateFulfillmentTracking(
    fulfillmentId: number,
    input: FulfillmentUpdateTrackingInput
  ): Promise<Fulfillment> {
    const data = await this.request<{ fulfillment: Fulfillment }>(
      `/fulfillments/${fulfillmentId}/update_tracking.json`,
      {
        method: 'POST',
        body: JSON.stringify({ fulfillment: toSnakeCase(input) }),
      }
    );
    return data.fulfillment;
  }

  async cancelFulfillment(fulfillmentId: number): Promise<Fulfillment> {
    const data = await this.request<{ fulfillment: Fulfillment }>(
      `/fulfillments/${fulfillmentId}/cancel.json`,
      { method: 'POST' }
    );
    return data.fulfillment;
  }

  // ===========================================================================
  // Fulfillment Orders
  // ===========================================================================

  async listFulfillmentOrders(orderId: number): Promise<FulfillmentOrder[]> {
    const data = await this.request<{ fulfillmentOrders: FulfillmentOrder[] }>(
      `/orders/${orderId}/fulfillment_orders.json`
    );
    return data.fulfillmentOrders;
  }

  async getFulfillmentOrder(fulfillmentOrderId: number): Promise<FulfillmentOrder> {
    const data = await this.request<{ fulfillmentOrder: FulfillmentOrder }>(
      `/fulfillment_orders/${fulfillmentOrderId}.json`
    );
    return data.fulfillmentOrder;
  }

  // ===========================================================================
  // Draft Orders
  // ===========================================================================

  async listDraftOrders(params?: DraftOrderListParams): Promise<PaginatedResponse<DraftOrder>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ draftOrders: DraftOrder[] }>(
      `/draft_orders.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.draftOrders,
      count: data.draftOrders.length,
      hasMore: data.draftOrders.length === (params?.limit || 50),
    };
  }

  async getDraftOrder(draftOrderId: number): Promise<DraftOrder> {
    const data = await this.request<{ draftOrder: DraftOrder }>(
      `/draft_orders/${draftOrderId}.json`
    );
    return data.draftOrder;
  }

  async createDraftOrder(input: DraftOrderCreateInput): Promise<DraftOrder> {
    const data = await this.request<{ draftOrder: DraftOrder }>('/draft_orders.json', {
      method: 'POST',
      body: JSON.stringify({ draftOrder: toSnakeCase(input) }),
    });
    return data.draftOrder;
  }

  async updateDraftOrder(draftOrderId: number, input: DraftOrderUpdateInput): Promise<DraftOrder> {
    const data = await this.request<{ draftOrder: DraftOrder }>(
      `/draft_orders/${draftOrderId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ draftOrder: toSnakeCase(input) }),
      }
    );
    return data.draftOrder;
  }

  async deleteDraftOrder(draftOrderId: number): Promise<void> {
    await this.request(`/draft_orders/${draftOrderId}.json`, { method: 'DELETE' });
  }

  async completeDraftOrder(draftOrderId: number, paymentPending = false): Promise<DraftOrder> {
    const data = await this.request<{ draftOrder: DraftOrder }>(
      `/draft_orders/${draftOrderId}/complete.json?payment_pending=${paymentPending}`,
      {
        method: 'PUT',
      }
    );
    return data.draftOrder;
  }

  async sendDraftOrderInvoice(
    draftOrderId: number,
    params?: { to?: string; from?: string; subject?: string; customMessage?: string }
  ): Promise<{ draftOrderInvoice: { to: string; from: string; subject: string } }> {
    const data = await this.request<{
      draftOrderInvoice: { to: string; from: string; subject: string };
    }>(`/draft_orders/${draftOrderId}/send_invoice.json`, {
      method: 'POST',
      body: params
        ? JSON.stringify({ draftOrderInvoice: toSnakeCase(params) })
        : JSON.stringify({ draftOrderInvoice: {} }),
    });
    return data;
  }

  // ===========================================================================
  // Transactions
  // ===========================================================================

  async listTransactions(orderId: number): Promise<Transaction[]> {
    const data = await this.request<{ transactions: Transaction[] }>(
      `/orders/${orderId}/transactions.json`
    );
    return data.transactions;
  }

  async getTransaction(orderId: number, transactionId: number): Promise<Transaction> {
    const data = await this.request<{ transaction: Transaction }>(
      `/orders/${orderId}/transactions/${transactionId}.json`
    );
    return data.transaction;
  }

  async createTransaction(orderId: number, input: TransactionCreateInput): Promise<Transaction> {
    const data = await this.request<{ transaction: Transaction }>(
      `/orders/${orderId}/transactions.json`,
      {
        method: 'POST',
        body: JSON.stringify({ transaction: toSnakeCase(input) }),
      }
    );
    return data.transaction;
  }

  // ===========================================================================
  // Refunds
  // ===========================================================================

  async listRefunds(orderId: number): Promise<Refund[]> {
    const data = await this.request<{ refunds: Refund[] }>(`/orders/${orderId}/refunds.json`);
    return data.refunds;
  }

  async getRefund(orderId: number, refundId: number): Promise<Refund> {
    const data = await this.request<{ refund: Refund }>(
      `/orders/${orderId}/refunds/${refundId}.json`
    );
    return data.refund;
  }

  async createRefund(orderId: number, input: RefundCreateInput): Promise<Refund> {
    const data = await this.request<{ refund: Refund }>(`/orders/${orderId}/refunds.json`, {
      method: 'POST',
      body: JSON.stringify({ refund: toSnakeCase(input) }),
    });
    return data.refund;
  }

  async calculateRefund(orderId: number, input: RefundCalculateInput): Promise<Refund> {
    const data = await this.request<{ refund: Refund }>(
      `/orders/${orderId}/refunds/calculate.json`,
      {
        method: 'POST',
        body: JSON.stringify({ refund: toSnakeCase(input) }),
      }
    );
    return data.refund;
  }

  // ===========================================================================
  // Price Rules
  // ===========================================================================

  async listPriceRules(params?: PriceRuleListParams): Promise<PaginatedResponse<PriceRule>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ priceRules: PriceRule[] }>(
      `/price_rules.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.priceRules,
      count: data.priceRules.length,
      hasMore: data.priceRules.length === (params?.limit || 50),
    };
  }

  async getPriceRule(priceRuleId: number): Promise<PriceRule> {
    const data = await this.request<{ priceRule: PriceRule }>(`/price_rules/${priceRuleId}.json`);
    return data.priceRule;
  }

  async createPriceRule(input: PriceRuleCreateInput): Promise<PriceRule> {
    const data = await this.request<{ priceRule: PriceRule }>('/price_rules.json', {
      method: 'POST',
      body: JSON.stringify({ priceRule: toSnakeCase(input) }),
    });
    return data.priceRule;
  }

  async updatePriceRule(priceRuleId: number, input: PriceRuleUpdateInput): Promise<PriceRule> {
    const data = await this.request<{ priceRule: PriceRule }>(`/price_rules/${priceRuleId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ priceRule: toSnakeCase(input) }),
    });
    return data.priceRule;
  }

  async deletePriceRule(priceRuleId: number): Promise<void> {
    await this.request(`/price_rules/${priceRuleId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Discount Codes
  // ===========================================================================

  async listDiscountCodes(priceRuleId: number): Promise<DiscountCodeEntity[]> {
    const data = await this.request<{ discountCodes: DiscountCodeEntity[] }>(
      `/price_rules/${priceRuleId}/discount_codes.json`
    );
    return data.discountCodes;
  }

  async createDiscountCode(
    priceRuleId: number,
    input: DiscountCodeCreateInput
  ): Promise<DiscountCodeEntity> {
    const data = await this.request<{ discountCode: DiscountCodeEntity }>(
      `/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: 'POST',
        body: JSON.stringify({ discountCode: toSnakeCase(input) }),
      }
    );
    return data.discountCode;
  }

  async getDiscountCode(priceRuleId: number, discountCodeId: number): Promise<DiscountCodeEntity> {
    const data = await this.request<{ discountCode: DiscountCodeEntity }>(
      `/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`
    );
    return data.discountCode;
  }

  async updateDiscountCode(
    priceRuleId: number,
    discountCodeId: number,
    code: string
  ): Promise<DiscountCodeEntity> {
    const data = await this.request<{ discountCode: DiscountCodeEntity }>(
      `/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ discountCode: { code } }),
      }
    );
    return data.discountCode;
  }

  async deleteDiscountCode(priceRuleId: number, discountCodeId: number): Promise<void> {
    await this.request(`/price_rules/${priceRuleId}/discount_codes/${discountCodeId}.json`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async listWebhooks(params?: WebhookListParams): Promise<PaginatedResponse<Webhook>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ webhooks: Webhook[] }>(
      `/webhooks.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.webhooks,
      count: data.webhooks.length,
      hasMore: data.webhooks.length === (params?.limit || 50),
    };
  }

  async getWebhook(webhookId: number): Promise<Webhook> {
    const data = await this.request<{ webhook: Webhook }>(`/webhooks/${webhookId}.json`);
    return data.webhook;
  }

  async createWebhook(input: WebhookCreateInput): Promise<Webhook> {
    const data = await this.request<{ webhook: Webhook }>('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({ webhook: toSnakeCase(input) }),
    });
    return data.webhook;
  }

  async updateWebhook(webhookId: number, input: WebhookUpdateInput): Promise<Webhook> {
    const data = await this.request<{ webhook: Webhook }>(`/webhooks/${webhookId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ webhook: toSnakeCase(input) }),
    });
    return data.webhook;
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    await this.request(`/webhooks/${webhookId}.json`, { method: 'DELETE' });
  }

  async getWebhookCount(params?: WebhookListParams): Promise<number> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ count: number }>(
      `/webhooks/count.json${query ? `?${query}` : ''}`
    );
    return data.count;
  }

  // ===========================================================================
  // Themes
  // ===========================================================================

  async listThemes(): Promise<Theme[]> {
    const data = await this.request<{ themes: Theme[] }>('/themes.json');
    return data.themes;
  }

  async getTheme(themeId: number): Promise<Theme> {
    const data = await this.request<{ theme: Theme }>(`/themes/${themeId}.json`);
    return data.theme;
  }

  async createTheme(input: ThemeCreateInput): Promise<Theme> {
    const data = await this.request<{ theme: Theme }>('/themes.json', {
      method: 'POST',
      body: JSON.stringify({ theme: toSnakeCase(input) }),
    });
    return data.theme;
  }

  async updateTheme(themeId: number, input: ThemeUpdateInput): Promise<Theme> {
    const data = await this.request<{ theme: Theme }>(`/themes/${themeId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ theme: toSnakeCase(input) }),
    });
    return data.theme;
  }

  async deleteTheme(themeId: number): Promise<void> {
    await this.request(`/themes/${themeId}.json`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Theme Assets
  // ===========================================================================

  async listAssets(themeId: number): Promise<Asset[]> {
    const data = await this.request<{ assets: Asset[] }>(`/themes/${themeId}/assets.json`);
    return data.assets;
  }

  async getAsset(themeId: number, key: string): Promise<Asset> {
    const data = await this.request<{ asset: Asset }>(
      `/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`
    );
    return data.asset;
  }

  async createOrUpdateAsset(themeId: number, input: AssetCreateInput): Promise<Asset> {
    const data = await this.request<{ asset: Asset }>(`/themes/${themeId}/assets.json`, {
      method: 'PUT',
      body: JSON.stringify({ asset: toSnakeCase(input) }),
    });
    return data.asset;
  }

  async deleteAsset(themeId: number, key: string): Promise<void> {
    await this.request(`/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Metafields
  // ===========================================================================

  async listMetafields(
    ownerResource: string,
    ownerId: number,
    params?: MetafieldListParams
  ): Promise<PaginatedResponse<Metafield>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ metafields: Metafield[] }>(
      `/${ownerResource}/${ownerId}/metafields.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.metafields,
      count: data.metafields.length,
      hasMore: data.metafields.length === (params?.limit || 50),
    };
  }

  async getMetafield(
    ownerResource: string,
    ownerId: number,
    metafieldId: number
  ): Promise<Metafield> {
    const data = await this.request<{ metafield: Metafield }>(
      `/${ownerResource}/${ownerId}/metafields/${metafieldId}.json`
    );
    return data.metafield;
  }

  async createMetafield(
    ownerResource: string,
    ownerId: number,
    input: MetafieldCreateInput
  ): Promise<Metafield> {
    const data = await this.request<{ metafield: Metafield }>(
      `/${ownerResource}/${ownerId}/metafields.json`,
      {
        method: 'POST',
        body: JSON.stringify({ metafield: toSnakeCase(input) }),
      }
    );
    return data.metafield;
  }

  async updateMetafield(
    ownerResource: string,
    ownerId: number,
    metafieldId: number,
    input: MetafieldUpdateInput
  ): Promise<Metafield> {
    const data = await this.request<{ metafield: Metafield }>(
      `/${ownerResource}/${ownerId}/metafields/${metafieldId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ metafield: toSnakeCase(input) }),
      }
    );
    return data.metafield;
  }

  async deleteMetafield(
    ownerResource: string,
    ownerId: number,
    metafieldId: number
  ): Promise<void> {
    await this.request(`/${ownerResource}/${ownerId}/metafields/${metafieldId}.json`, {
      method: 'DELETE',
    });
  }

  async listShopMetafields(params?: MetafieldListParams): Promise<PaginatedResponse<Metafield>> {
    const query = params ? this.buildQueryParams(params) : '';
    const data = await this.request<{ metafields: Metafield[] }>(
      `/metafields.json${query ? `?${query}` : ''}`
    );
    return {
      items: data.metafields,
      count: data.metafields.length,
      hasMore: data.metafields.length === (params?.limit || 50),
    };
  }

  async createShopMetafield(input: MetafieldCreateInput): Promise<Metafield> {
    const data = await this.request<{ metafield: Metafield }>('/metafields.json', {
      method: 'POST',
      body: JSON.stringify({ metafield: toSnakeCase(input) }),
    });
    return data.metafield;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Shopify client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple Shopify stores.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createShopifyClient(credentials: TenantCredentials): ShopifyClient {
  return new ShopifyClientImpl(credentials);
}
