/**
 * Shopify Entity Types
 *
 * Type definitions for Shopify Admin REST API entities.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  [key: string]: unknown;
  /** Number of items to return (max 250) */
  limit?: number;
  /** Return items after this ID */
  sinceId?: string;
  /** Fields to return (comma-separated) */
  fields?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Total count (if available) */
  total?: number;
  /** Next page cursor/link */
  nextCursor?: string;
  /** Next page info (legacy) */
  nextPageInfo?: string;
}

// =============================================================================
// Shop
// =============================================================================

export interface Shop {
  id: number;
  name: string;
  email: string;
  domain: string;
  myshopifyDomain: string;
  shopOwner: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  countryName: string;
  zip: string;
  currency: string;
  moneyFormat: string;
  timezone: string;
  ianaTimezone: string;
  planName: string;
  planDisplayName: string;
  weightUnit: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Product
// =============================================================================

export interface Product {
  id: number;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  handle: string;
  status: ProductStatus;
  tags: string;
  templateSuffix: string;
  publishedScope: string;
  variants: ProductVariant[];
  options: ProductOption[];
  images: ProductImage[];
  image?: ProductImage;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ProductStatus = 'active' | 'archived' | 'draft';

export interface ProductVariant {
  id: number;
  productId: number;
  title: string;
  price: string;
  compareAtPrice: string | null;
  sku: string;
  barcode: string;
  position: number;
  inventoryPolicy: 'deny' | 'continue';
  fulfillmentService: string;
  inventoryManagement: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  taxable: boolean;
  taxCode: string;
  weight: number;
  weightUnit: string;
  inventoryItemId: number;
  inventoryQuantity: number;
  oldInventoryQuantity: number;
  requiresShipping: boolean;
  imageId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOption {
  id: number;
  productId: number;
  name: string;
  position: number;
  values: string[];
}

export interface ProductImage {
  id: number;
  productId: number;
  position: number;
  width: number;
  height: number;
  src: string;
  alt: string | null;
  variantIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateInput {
  title: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  status?: ProductStatus;
  variants?: Partial<ProductVariant>[];
  options?: Partial<ProductOption>[];
  images?: Partial<ProductImage>[];
}

export interface ProductUpdateInput {
  title?: string;
  bodyHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string;
  status?: ProductStatus;
}

export interface ProductListParams extends PaginationParams {
  ids?: string;
  title?: string;
  vendor?: string;
  productType?: string;
  collectionId?: string;
  handle?: string;
  status?: ProductStatus;
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
  publishedAtMin?: string;
  publishedAtMax?: string;
  publishedStatus?: 'published' | 'unpublished' | 'any';
}

// =============================================================================
// Collection
// =============================================================================

export interface Collection {
  id: number;
  title: string;
  handle: string;
  bodyHtml: string;
  sortOrder: string;
  templateSuffix: string;
  publishedScope: string;
  image?: CollectionImage;
  publishedAt: string;
  updatedAt: string;
}

export interface CollectionImage {
  src: string;
  alt: string | null;
  width: number;
  height: number;
  createdAt: string;
}

export interface CustomCollection extends Collection {
  disjunctive?: boolean;
}

export interface SmartCollection extends Collection {
  disjunctive: boolean;
  rules: SmartCollectionRule[];
}

export interface SmartCollectionRule {
  column: string;
  relation: string;
  condition: string;
}

export interface CollectionCreateInput {
  title: string;
  bodyHtml?: string;
  handle?: string;
  image?: { src?: string; alt?: string };
  published?: boolean;
  sortOrder?: string;
  templateSuffix?: string;
}

export interface CollectionUpdateInput {
  title?: string;
  bodyHtml?: string;
  handle?: string;
  image?: { src: string; alt?: string } | null;
  published?: boolean;
  sortOrder?: string;
  templateSuffix?: string;
}

export interface SmartCollectionCreateInput extends CollectionCreateInput {
  rules: SmartCollectionRule[];
  disjunctive?: boolean;
}

export interface CollectionListParams extends PaginationParams {
  ids?: string;
  handle?: string;
  productId?: string;
  title?: string;
  publishedStatus?: 'published' | 'unpublished' | 'any';
  updatedAtMin?: string;
  updatedAtMax?: string;
}

// =============================================================================
// Order
// =============================================================================

export interface Order {
  id: number;
  name: string;
  email: string;
  phone: string;
  orderNumber: number;
  token: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  totalDiscounts: string;
  totalWeight: number;
  currency: string;
  financialStatus: OrderFinancialStatus;
  fulfillmentStatus: OrderFulfillmentStatus | null;
  confirmed: boolean;
  cancelReason: string | null;
  cancelledAt: string | null;
  closedAt: string | null;
  processedAt: string;
  test: boolean;
  note: string;
  noteAttributes: NoteAttribute[];
  tags: string;
  customer: Customer | null;
  billingAddress: Address | null;
  shippingAddress: Address | null;
  lineItems: LineItem[];
  fulfillments: Fulfillment[];
  refunds: Refund[];
  shippingLines: ShippingLine[];
  taxLines: TaxLine[];
  discountCodes: DiscountCode[];
  discountApplications: DiscountApplication[];
  createdAt: string;
  updatedAt: string;
}

export type OrderFinancialStatus =
  | 'pending'
  | 'authorized'
  | 'partially_paid'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'voided';

export type OrderFulfillmentStatus = 'fulfilled' | 'partial' | 'unfulfilled' | 'restocked';

export interface LineItem {
  id: number;
  variantId: number;
  productId: number;
  title: string;
  variantTitle: string;
  name: string;
  sku: string;
  vendor: string;
  quantity: number;
  price: string;
  totalDiscount: string;
  fulfillableQuantity: number;
  fulfillmentStatus: string | null;
  fulfillmentService: string;
  giftCard: boolean;
  taxable: boolean;
  taxLines: TaxLine[];
  properties: NoteAttribute[];
  requiresShipping: boolean;
}

export interface ShippingLine {
  id: number;
  title: string;
  code: string;
  source: string;
  price: string;
  discountedPrice: string;
  taxLines: TaxLine[];
}

export interface TaxLine {
  title: string;
  price: string;
  rate: number;
}

export interface DiscountCode {
  code: string;
  amount: string;
  type: string;
}

export interface DiscountApplication {
  type: string;
  value: string;
  valueType: string;
  allocationMethod: string;
  targetSelection: string;
  targetType: string;
  title?: string;
  description?: string;
  code?: string;
}

export interface NoteAttribute {
  name: string;
  value: string;
}

export interface OrderListParams extends PaginationParams {
  ids?: string;
  status?: 'open' | 'closed' | 'cancelled' | 'any';
  financialStatus?: OrderFinancialStatus | 'any' | 'unpaid';
  fulfillmentStatus?: OrderFulfillmentStatus | 'shipped' | 'unshipped' | 'any';
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
  processedAtMin?: string;
  processedAtMax?: string;
  attributionAppId?: string;
}

export interface OrderCreateInput {
  lineItems: Array<{
    variantId?: number;
    quantity: number;
    title?: string;
    price?: string;
  }>;
  customer?: { id?: number; email?: string } | CustomerCreateInput;
  billingAddress?: Partial<Address>;
  shippingAddress?: Partial<Address>;
  email?: string;
  phone?: string;
  note?: string;
  tags?: string;
  shippingLines?: Array<{
    title: string;
    price: string;
    code?: string;
  }>;
  taxLines?: Array<{
    title: string;
    price: string;
    rate: number;
  }>;
  discountCodes?: Array<{
    code: string;
    amount: string;
    type: string;
  }>;
  financialStatus?: OrderFinancialStatus | string;
  fulfillmentStatus?: OrderFulfillmentStatus | string;
  sendReceipt?: boolean;
  sendFulfillmentReceipt?: boolean;
  inventoryBehaviour?: 'bypass' | 'decrement_ignoring_policy' | 'decrement_obeying_policy';
}

export interface OrderUpdateInput {
  note?: string;
  tags?: string;
  email?: string;
  phone?: string;
  shippingAddress?: Partial<Address>;
  billingAddress?: Partial<Address>;
}

// =============================================================================
// Customer
// =============================================================================

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  ordersCount: number;
  totalSpent: string;
  state: 'disabled' | 'invited' | 'enabled' | 'declined';
  note: string;
  verifiedEmail: boolean;
  taxExempt: boolean;
  taxExemptions: string[];
  tags: string;
  currency: string;
  addresses: Address[];
  defaultAddress: Address | null;
  acceptsMarketing: boolean;
  acceptsMarketingUpdatedAt: string;
  marketingOptInLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  note?: string;
  tags?: string;
  acceptsMarketing?: boolean;
  addresses?: Partial<Address>[];
  taxExempt?: boolean;
  sendEmailInvite?: boolean;
  sendEmailWelcome?: boolean;
}

export interface CustomerUpdateInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  note?: string;
  tags?: string;
  acceptsMarketing?: boolean;
  taxExempt?: boolean;
}

export interface CustomerListParams extends PaginationParams {
  ids?: string;
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
}

export interface CustomerSearchParams {
  [key: string]: unknown;
  query: string;
  limit?: number;
  order?: string;
  fields?: string;
}

// =============================================================================
// Address
// =============================================================================

export interface Address {
  id?: number;
  customerId?: number;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  countryName: string;
  zip: string;
  phone: string;
  name: string;
  default: boolean;
}

// =============================================================================
// Inventory
// =============================================================================

export interface InventoryLevel {
  inventoryItemId: number;
  locationId: number;
  available: number | null;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  cost: string | null;
  countryCodeOfOrigin: string | null;
  countryHarmonizedSystemCodes: Array<{
    harmonizedSystemCode: string;
    countryCode: string;
  }>;
  harmonizedSystemCode: string | null;
  provinceCodeOfOrigin: string | null;
  tracked: boolean;
  requiresShipping: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  provinceCode: string;
  country: string;
  countryCode: string;
  countryName: string;
  zip: string;
  phone: string;
  legacy: boolean;
  active: boolean;
  localizedCountryName: string;
  localizedProvinceName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLevelParams {
  [key: string]: unknown;
  inventoryItemIds?: number[] | string;
  locationIds?: number[] | string;
  limit?: number;
  updatedAtMin?: string;
}

export interface InventoryAdjustment {
  inventoryItemId: number;
  locationId: number;
  availableAdjustment: number;
}

export interface InventorySet {
  inventoryItemId: number;
  locationId: number;
  available: number;
}

// =============================================================================
// Fulfillment
// =============================================================================

export interface Fulfillment {
  id: number;
  orderId: number;
  status: FulfillmentStatus;
  createdAt: string;
  updatedAt: string;
  trackingCompany: string | null;
  trackingNumber: string | null;
  trackingNumbers: string[];
  trackingUrl: string | null;
  trackingUrls: string[];
  receipt: Record<string, unknown>;
  name: string;
  lineItems: LineItem[];
  notifyCustomer: boolean;
  shipmentStatus: string | null;
  locationId: number;
  originAddress: Address | null;
  service: string;
}

export type FulfillmentStatus = 'pending' | 'open' | 'success' | 'cancelled' | 'error' | 'failure';

export interface FulfillmentOrder {
  id: number;
  shopId: number;
  orderId: number;
  assignedLocationId: number;
  requestStatus: string;
  status: string;
  supportedActions: string[];
  destination: FulfillmentOrderDestination | null;
  lineItems: FulfillmentOrderLineItem[];
  fulfillAt: string | null;
  fulfillBy: string | null;
  internationalDuties: Record<string, unknown> | null;
  fulfillmentHolds: FulfillmentHold[];
  deliveryMethod: DeliveryMethod | null;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentOrderDestination {
  id: number;
  address1: string;
  address2: string;
  city: string;
  company: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  zip: string;
}

export interface FulfillmentOrderLineItem {
  id: number;
  shopId: number;
  fulfillmentOrderId: number;
  lineItemId: number;
  inventoryItemId: number;
  quantity: number;
  fulfillableQuantity: number;
  variantId: number;
}

export interface FulfillmentHold {
  reason: string;
  reasonNotes: string;
}

export interface DeliveryMethod {
  id: number;
  methodType: string;
}

export interface FulfillmentCreateInput {
  lineItemsByFulfillmentOrder: Array<{
    fulfillmentOrderId: number;
    fulfillmentOrderLineItems?: Array<{
      id: number;
      quantity: number;
    }>;
  }>;
  trackingInfo?: {
    company?: string;
    number?: string;
    url?: string;
    numbers?: string[];
    urls?: string[];
  };
  notifyCustomer?: boolean;
  originAddress?: Partial<Address>;
}

export interface FulfillmentUpdateTrackingInput {
  trackingInfo: {
    company?: string;
    number?: string;
    url?: string;
    numbers?: string[];
    urls?: string[];
  };
  notifyCustomer?: boolean;
}

// =============================================================================
// Draft Order
// =============================================================================

export interface DraftOrder {
  id: number;
  name: string;
  email: string;
  note: string;
  tags: string;
  taxExempt: boolean;
  taxesIncluded: boolean;
  currency: string;
  subtotalPrice: string;
  totalTax: string;
  totalPrice: string;
  invoiceSentAt: string | null;
  invoiceUrl: string;
  status: DraftOrderStatus;
  completedAt: string | null;
  orderId: number | null;
  customer: Customer | null;
  billingAddress: Address | null;
  shippingAddress: Address | null;
  lineItems: DraftOrderLineItem[];
  shippingLine: ShippingLine | null;
  taxLines: TaxLine[];
  appliedDiscount: AppliedDiscount | null;
  createdAt: string;
  updatedAt: string;
}

export type DraftOrderStatus = 'open' | 'invoice_sent' | 'completed';

export interface DraftOrderLineItem {
  id: number;
  variantId: number | null;
  productId: number | null;
  title: string;
  variantTitle: string;
  sku: string;
  vendor: string;
  quantity: number;
  price: string;
  grams: number;
  fulfillmentService: string;
  taxable: boolean;
  taxLines: TaxLine[];
  appliedDiscount: AppliedDiscount | null;
  requiresShipping: boolean;
  custom: boolean;
  giftCard: boolean;
  name: string;
  properties: NoteAttribute[];
}

export interface AppliedDiscount {
  title: string;
  description: string;
  value: string;
  valueType: 'fixed_amount' | 'percentage';
  amount: string;
}

export interface DraftOrderCreateInput {
  lineItems: Array<{
    variantId?: number;
    quantity: number;
    title?: string;
    price?: string;
    customAttributes?: NoteAttribute[];
    appliedDiscount?: Partial<AppliedDiscount>;
    taxable?: boolean;
    requiresShipping?: boolean;
  }>;
  customer?: { id?: number; email?: string };
  email?: string;
  billingAddress?: Partial<Address>;
  shippingAddress?: Partial<Address>;
  note?: string;
  tags?: string;
  taxExempt?: boolean;
  taxesIncluded?: boolean;
  shippingLine?: {
    title: string;
    price: string;
    custom?: boolean;
  };
  appliedDiscount?: Partial<AppliedDiscount>;
  useCustomerDefaultAddress?: boolean;
}

export interface DraftOrderUpdateInput {
  lineItems?: Array<{
    id?: number;
    variantId?: number;
    quantity: number;
    title?: string;
    price?: string;
    appliedDiscount?: Partial<AppliedDiscount>;
  }>;
  email?: string;
  billingAddress?: Partial<Address>;
  shippingAddress?: Partial<Address>;
  note?: string;
  tags?: string;
  taxExempt?: boolean;
  shippingLine?: {
    title: string;
    price: string;
  };
  appliedDiscount?: Partial<AppliedDiscount> | null;
}

export interface DraftOrderListParams extends PaginationParams {
  ids?: string;
  status?: DraftOrderStatus | 'any';
  updatedAtMin?: string;
  updatedAtMax?: string;
}

// =============================================================================
// Transaction
// =============================================================================

export interface Transaction {
  id: number;
  orderId: number;
  kind: TransactionKind;
  gateway: string;
  status: TransactionStatus;
  message: string;
  amount: string;
  currency: string;
  authorization: string;
  parentId: number | null;
  errorCode: string | null;
  sourceName: string;
  test: boolean;
  receipt: Record<string, unknown>;
  paymentDetails?: PaymentDetails;
  createdAt: string;
  processedAt: string;
}

export type TransactionKind = 'authorization' | 'capture' | 'sale' | 'void' | 'refund';

export type TransactionStatus = 'pending' | 'failure' | 'success' | 'error';

export interface PaymentDetails {
  creditCardBin: string;
  creditCardCompany: string;
  creditCardNumber: string;
  avsResultCode: string;
  cvvResultCode: string;
}

export interface TransactionCreateInput {
  kind: TransactionKind;
  amount?: string;
  currency?: string;
  authorization?: string;
  parentId?: number;
  source?: string;
  test?: boolean;
}

// =============================================================================
// Refund
// =============================================================================

export interface Refund {
  id: number;
  orderId: number;
  createdAt: string;
  note: string;
  restock: boolean;
  userId: number;
  processedAt: string;
  refundLineItems: RefundLineItem[];
  transactions: Transaction[];
  orderAdjustments: OrderAdjustment[];
}

export interface RefundLineItem {
  id: number;
  lineItemId: number;
  lineItem: LineItem;
  quantity: number;
  restockType: 'no_restock' | 'cancel' | 'return' | 'legacy_restock';
  locationId: number | null;
  subtotal: string;
  subtotalSet: MoneySet;
  totalTax: string;
  totalTaxSet: MoneySet;
}

export interface OrderAdjustment {
  id: number;
  orderId: number;
  refundId: number;
  amount: string;
  amountSet: MoneySet;
  taxAmount: string;
  taxAmountSet: MoneySet;
  kind: string;
  reason: string;
}

export interface MoneySet {
  shopMoney: Money;
  presentmentMoney: Money;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface RefundCreateInput {
  notify?: boolean;
  note?: string;
  shipping?: {
    fullRefund?: boolean;
    amount?: string;
  };
  refundLineItems?: Array<{
    lineItemId: number;
    quantity: number;
    restockType?: 'no_restock' | 'cancel' | 'return';
    locationId?: number;
  }>;
  transactions?: Array<{
    parentId?: number;
    amount: string;
    kind?: string;
    gateway?: string;
  }>;
  currency?: string;
}

export interface RefundCalculateInput {
  shipping?: {
    fullRefund?: boolean;
    amount?: string;
  };
  refundLineItems?: Array<{
    lineItemId: number;
    quantity: number;
    restockType?: 'no_restock' | 'cancel' | 'return';
  }>;
  currency?: string;
}

// =============================================================================
// Price Rule & Discount Code
// =============================================================================

export interface PriceRule {
  id: number;
  title: string;
  targetType: 'line_item' | 'shipping_line';
  targetSelection: 'all' | 'entitled';
  allocationMethod: 'across' | 'each';
  valueType: 'fixed_amount' | 'percentage';
  value: string;
  customerSelection: 'all' | 'prerequisite';
  oncePerCustomer: boolean;
  usageLimit: number | null;
  startsAt: string;
  endsAt: string | null;
  prerequisiteSubtotalRange: PriceRuleRange | null;
  prerequisiteQuantityRange: PriceRuleRange | null;
  prerequisiteShippingPriceRange: PriceRuleRange | null;
  prerequisiteToEntitlementQuantityRatio: {
    prerequisiteQuantity: number;
    entitledQuantity: number;
  } | null;
  prerequisiteToEntitlementPurchase: {
    prerequisiteAmount: string;
  } | null;
  entitledProductIds: number[];
  entitledVariantIds: number[];
  entitledCollectionIds: number[];
  entitledCountryIds: number[];
  prerequisiteProductIds: number[];
  prerequisiteVariantIds: number[];
  prerequisiteCollectionIds: number[];
  prerequisiteCustomerIds: number[];
  prerequisiteSavedSearchIds: number[];
  allocationLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRuleRange {
  greaterThanOrEqualTo: string | number;
}

export interface PriceRuleCreateInput {
  title: string;
  targetType: 'line_item' | 'shipping_line';
  targetSelection: 'all' | 'entitled';
  allocationMethod: 'across' | 'each';
  valueType: 'fixed_amount' | 'percentage';
  value: string;
  customerSelection: 'all' | 'prerequisite';
  oncePerCustomer?: boolean;
  usageLimit?: number;
  startsAt: string;
  endsAt?: string;
  entitledProductIds?: number[];
  entitledVariantIds?: number[];
  entitledCollectionIds?: number[];
  prerequisiteProductIds?: number[];
  prerequisiteVariantIds?: number[];
  prerequisiteCollectionIds?: number[];
  prerequisiteCustomerIds?: number[];
  prerequisiteSubtotalRange?: PriceRuleRange;
  prerequisiteQuantityRange?: PriceRuleRange;
  prerequisiteShippingPriceRange?: PriceRuleRange;
}

export interface PriceRuleUpdateInput {
  title?: string;
  value?: string;
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
  entitledProductIds?: number[];
  entitledVariantIds?: number[];
  entitledCollectionIds?: number[];
  prerequisiteProductIds?: number[];
  prerequisiteVariantIds?: number[];
  prerequisiteCollectionIds?: number[];
  prerequisiteCustomerIds?: number[];
}

export interface PriceRuleListParams extends PaginationParams {
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
  startsAtMin?: string;
  startsAtMax?: string;
  endsAtMin?: string;
  endsAtMax?: string;
  timesUsed?: number;
}

export interface DiscountCodeEntity {
  id: number;
  priceRuleId: number;
  code: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCodeCreateInput {
  code: string;
}

// =============================================================================
// Webhook
// =============================================================================

export interface Webhook {
  id: number;
  address: string;
  topic: string;
  format: 'json' | 'xml';
  fields: string[];
  metafieldNamespaces: string[];
  privateMetafieldNamespaces: string[];
  apiVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookCreateInput {
  address: string;
  topic: string;
  format?: 'json' | 'xml';
  fields?: string[];
  metafieldNamespaces?: string[];
}

export interface WebhookUpdateInput {
  address?: string;
  fields?: string[];
  metafieldNamespaces?: string[];
}

export interface WebhookListParams extends PaginationParams {
  address?: string;
  topic?: string;
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
}

// =============================================================================
// Theme & Asset
// =============================================================================

export interface Theme {
  id: number;
  name: string;
  role: 'main' | 'unpublished' | 'demo' | 'development';
  themeStoreId: number | null;
  previewable: boolean;
  processing: boolean;
  adminGraphqlApiId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCreateInput {
  name: string;
  src?: string;
  role?: 'main' | 'unpublished';
}

export interface ThemeUpdateInput {
  name?: string;
  role?: 'main' | 'unpublished';
}

export interface Asset {
  key: string;
  publicUrl: string | null;
  value?: string;
  attachment?: string;
  contentType: string;
  size: number;
  checksum: string;
  themeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCreateInput {
  key: string;
  value?: string;
  attachment?: string;
  src?: string;
  sourceKey?: string;
}

// =============================================================================
// Metafield
// =============================================================================

export interface Metafield {
  id: number;
  namespace: string;
  key: string;
  value: string;
  type: string;
  description: string | null;
  ownerId: number;
  ownerResource: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetafieldCreateInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export interface MetafieldUpdateInput {
  value?: string;
  type?: string;
  description?: string;
}

export interface MetafieldListParams extends PaginationParams {
  namespace?: string;
  key?: string;
  type?: string;
  metafieldNamespaces?: string;
  createdAtMin?: string;
  createdAtMax?: string;
  updatedAtMin?: string;
  updatedAtMax?: string;
}

// =============================================================================
// Collect (Product-Collection relationship)
// =============================================================================

export interface Collect {
  id: number;
  collectionId: number;
  productId: number;
  position: number;
  sortValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectCreateInput {
  productId: number;
  collectionId: number;
}

export interface CollectListParams extends PaginationParams {
  productId?: number | string;
  collectionId?: number | string;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
