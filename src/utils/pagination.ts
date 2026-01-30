/**
 * Pagination Utilities
 *
 * Helpers for handling pagination in Shopify API.
 */

import type { PaginatedResponse, PaginationParams } from '../types/entities.js';

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  limit: 50,
  maxLimit: 250,
} as const;

/**
 * Normalize pagination parameters
 */
export function normalizePaginationParams(
  params?: PaginationParams,
  maxLimit = PAGINATION_DEFAULTS.maxLimit
): Required<Pick<PaginationParams, 'limit'>> & Omit<PaginationParams, 'limit'> {
  return {
    limit: Math.min(params?.limit || PAGINATION_DEFAULTS.limit, maxLimit),
    sinceId: params?.sinceId,
    fields: params?.fields,
  };
}

/**
 * Create an empty paginated response
 */
export function emptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    items: [],
    count: 0,
    hasMore: false,
  };
}

/**
 * Create a paginated response from an array
 */
export function createPaginatedResponse<T>(
  items: T[],
  options: {
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
  } = {}
): PaginatedResponse<T> {
  return {
    items,
    count: items.length,
    total: options.total,
    hasMore: options.hasMore ?? false,
    nextCursor: options.nextCursor,
  };
}

/**
 * Calculate if there are more items based on limit
 * (Shopify indicates more items if returned count equals limit)
 */
export function hasMoreItems(returnedCount: number, requestedLimit: number): boolean {
  return returnedCount >= requestedLimit;
}

/**
 * Parse Link header for page_info cursor (Shopify pagination)
 */
export function parseLinkHeader(linkHeader: string | null): {
  next?: string;
  previous?: string;
} {
  if (!linkHeader) return {};

  const result: { next?: string; previous?: string } = {};
  const links = linkHeader.split(',');

  for (const link of links) {
    const match = link.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="(\w+)"/);
    if (match) {
      const [, pageInfo, rel] = match;
      if (rel === 'next') {
        result.next = pageInfo;
      } else if (rel === 'previous') {
        result.previous = pageInfo;
      }
    }
  }

  return result;
}
