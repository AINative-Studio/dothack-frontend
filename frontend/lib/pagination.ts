export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount?: number
  hasMore: boolean
  nextOffset?: number
}

export const DEFAULT_PAGE_SIZE = 50
export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function calculateNextOffset(
  currentOffset: number,
  pageSize: number,
  itemsReturned: number
): number | undefined {
  if (itemsReturned < pageSize) {
    return undefined
  }
  return currentOffset + pageSize
}

export function hasMorePages(itemsReturned: number, pageSize: number): boolean {
  return itemsReturned >= pageSize
}

export function getNextPageParam<T>(
  lastPage: T[],
  allPages: T[][],
  pageSize: number
): number | undefined {
  if (lastPage.length < pageSize) {
    return undefined
  }
  return allPages.length * pageSize
}

export function flattenPages<T>(pages: T[][] | undefined): T[] {
  if (!pages) return []
  return pages.flat()
}

export function getTotalItems<T>(pages: T[][] | undefined): number {
  return flattenPages(pages).length
}

export function getPaginationInfo(
  currentPage: number,
  pageSize: number,
  totalItems?: number
): {
  startItem: number
  endItem: number
  totalPages?: number
  hasNext: boolean
  hasPrevious: boolean
} {
  const startItem = currentPage * pageSize + 1
  const endItem = totalItems !== undefined
    ? Math.min((currentPage + 1) * pageSize, totalItems)
    : (currentPage + 1) * pageSize
  const totalPages = totalItems !== undefined ? Math.ceil(totalItems / pageSize) : undefined
  const hasNext = totalItems !== undefined ? endItem < totalItems : true
  const hasPrevious = currentPage > 0

  return {
    startItem,
    endItem,
    totalPages,
    hasNext,
    hasPrevious,
  }
}

export function createPaginationParams(
  pageSize: number,
  pageParam: number = 0
): PaginationParams {
  return {
    limit: pageSize,
    offset: pageParam,
  }
}
