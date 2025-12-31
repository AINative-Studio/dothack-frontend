import {
  calculateNextOffset,
  hasMorePages,
  getNextPageParam,
  flattenPages,
  getTotalItems,
  getPaginationInfo,
  createPaginationParams,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PageSize,
} from '@/lib/pagination'

describe('pagination', () => {
  describe('constants', () => {
    it('has correct default page size', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(50)
    })

    it('has correct page size options', () => {
      expect(PAGE_SIZE_OPTIONS).toEqual([25, 50, 100])
    })
  })

  describe('calculateNextOffset', () => {
    it('returns next offset when page is full', () => {
      const nextOffset = calculateNextOffset(0, 50, 50)
      expect(nextOffset).toBe(50)
    })

    it('returns undefined when page is not full', () => {
      const nextOffset = calculateNextOffset(0, 50, 30)
      expect(nextOffset).toBeUndefined()
    })

    it('calculates correct offset for second page', () => {
      const nextOffset = calculateNextOffset(50, 50, 50)
      expect(nextOffset).toBe(100)
    })

    it('returns undefined when no items returned', () => {
      const nextOffset = calculateNextOffset(0, 50, 0)
      expect(nextOffset).toBeUndefined()
    })

    it('handles different page sizes', () => {
      expect(calculateNextOffset(0, 25, 25)).toBe(25)
      expect(calculateNextOffset(25, 25, 25)).toBe(50)
      expect(calculateNextOffset(0, 100, 100)).toBe(100)
    })
  })

  describe('hasMorePages', () => {
    it('returns true when page is full', () => {
      expect(hasMorePages(50, 50)).toBe(true)
    })

    it('returns false when page is not full', () => {
      expect(hasMorePages(30, 50)).toBe(false)
    })

    it('returns false when no items returned', () => {
      expect(hasMorePages(0, 50)).toBe(false)
    })

    it('handles edge case where items equal page size', () => {
      expect(hasMorePages(50, 50)).toBe(true)
    })

    it('handles different page sizes', () => {
      expect(hasMorePages(25, 25)).toBe(true)
      expect(hasMorePages(24, 25)).toBe(false)
      expect(hasMorePages(100, 100)).toBe(true)
      expect(hasMorePages(99, 100)).toBe(false)
    })
  })

  describe('getNextPageParam', () => {
    it('returns next offset for full first page', () => {
      const lastPage = Array(50).fill({ id: '1' })
      const allPages = [lastPage]
      const nextParam = getNextPageParam(lastPage, allPages, 50)
      expect(nextParam).toBe(50)
    })

    it('returns undefined for partial first page', () => {
      const lastPage = Array(30).fill({ id: '1' })
      const allPages = [lastPage]
      const nextParam = getNextPageParam(lastPage, allPages, 50)
      expect(nextParam).toBeUndefined()
    })

    it('returns correct offset for second page', () => {
      const page1 = Array(50).fill({ id: '1' })
      const page2 = Array(50).fill({ id: '2' })
      const allPages = [page1, page2]
      const nextParam = getNextPageParam(page2, allPages, 50)
      expect(nextParam).toBe(100)
    })

    it('returns undefined for last partial page', () => {
      const page1 = Array(50).fill({ id: '1' })
      const page2 = Array(20).fill({ id: '2' })
      const allPages = [page1, page2]
      const nextParam = getNextPageParam(page2, allPages, 50)
      expect(nextParam).toBeUndefined()
    })

    it('handles empty last page', () => {
      const lastPage: Array<{ id: string }> = []
      const allPages = [lastPage]
      const nextParam = getNextPageParam(lastPage, allPages, 50)
      expect(nextParam).toBeUndefined()
    })

    it('handles different page sizes', () => {
      const lastPage = Array(25).fill({ id: '1' })
      const allPages = [lastPage]
      expect(getNextPageParam(lastPage, allPages, 25)).toBe(25)
      expect(getNextPageParam(lastPage, allPages, 50)).toBeUndefined()
    })
  })

  describe('flattenPages', () => {
    it('flattens multiple pages into single array', () => {
      const pages = [
        [{ id: '1' }, { id: '2' }],
        [{ id: '3' }, { id: '4' }],
        [{ id: '5' }],
      ]
      const flattened = flattenPages(pages)
      expect(flattened).toHaveLength(5)
      expect(flattened).toEqual([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
      ])
    })

    it('returns empty array for undefined pages', () => {
      const flattened = flattenPages(undefined)
      expect(flattened).toEqual([])
    })

    it('returns empty array for empty pages', () => {
      const flattened = flattenPages([])
      expect(flattened).toEqual([])
    })

    it('handles single page', () => {
      const pages = [[{ id: '1' }, { id: '2' }]]
      const flattened = flattenPages(pages)
      expect(flattened).toHaveLength(2)
      expect(flattened).toEqual([{ id: '1' }, { id: '2' }])
    })

    it('handles pages with empty arrays', () => {
      const pages = [[{ id: '1' }], [], [{ id: '2' }]]
      const flattened = flattenPages(pages)
      expect(flattened).toHaveLength(2)
      expect(flattened).toEqual([{ id: '1' }, { id: '2' }])
    })
  })

  describe('getTotalItems', () => {
    it('counts total items across all pages', () => {
      const pages = [
        [{ id: '1' }, { id: '2' }],
        [{ id: '3' }, { id: '4' }],
        [{ id: '5' }],
      ]
      const total = getTotalItems(pages)
      expect(total).toBe(5)
    })

    it('returns 0 for undefined pages', () => {
      const total = getTotalItems(undefined)
      expect(total).toBe(0)
    })

    it('returns 0 for empty pages', () => {
      const total = getTotalItems([])
      expect(total).toBe(0)
    })

    it('handles single page', () => {
      const pages = [[{ id: '1' }, { id: '2' }, { id: '3' }]]
      const total = getTotalItems(pages)
      expect(total).toBe(3)
    })
  })

  describe('getPaginationInfo', () => {
    it('calculates correct info for first page', () => {
      const info = getPaginationInfo(0, 50, 150)
      expect(info.startItem).toBe(1)
      expect(info.endItem).toBe(50)
      expect(info.totalPages).toBe(3)
      expect(info.hasNext).toBe(true)
      expect(info.hasPrevious).toBe(false)
    })

    it('calculates correct info for middle page', () => {
      const info = getPaginationInfo(1, 50, 150)
      expect(info.startItem).toBe(51)
      expect(info.endItem).toBe(100)
      expect(info.totalPages).toBe(3)
      expect(info.hasNext).toBe(true)
      expect(info.hasPrevious).toBe(true)
    })

    it('calculates correct info for last page', () => {
      const info = getPaginationInfo(2, 50, 150)
      expect(info.startItem).toBe(101)
      expect(info.endItem).toBe(150)
      expect(info.totalPages).toBe(3)
      expect(info.hasNext).toBe(false)
      expect(info.hasPrevious).toBe(true)
    })

    it('handles partial last page', () => {
      const info = getPaginationInfo(2, 50, 120)
      expect(info.startItem).toBe(101)
      expect(info.endItem).toBe(120)
      expect(info.totalPages).toBe(3)
      expect(info.hasNext).toBe(false)
      expect(info.hasPrevious).toBe(true)
    })

    it('handles unknown total items', () => {
      const info = getPaginationInfo(0, 50)
      expect(info.startItem).toBe(1)
      expect(info.endItem).toBe(50)
      expect(info.totalPages).toBeUndefined()
      expect(info.hasNext).toBe(true)
      expect(info.hasPrevious).toBe(false)
    })

    it('handles first page with unknown total', () => {
      const info = getPaginationInfo(0, 50)
      expect(info.startItem).toBe(1)
      expect(info.endItem).toBe(50)
      expect(info.totalPages).toBeUndefined()
      expect(info.hasNext).toBe(true)
      expect(info.hasPrevious).toBe(false)
    })

    it('handles different page sizes', () => {
      const info25 = getPaginationInfo(0, 25, 100)
      expect(info25.startItem).toBe(1)
      expect(info25.endItem).toBe(25)
      expect(info25.totalPages).toBe(4)

      const info100 = getPaginationInfo(0, 100, 100)
      expect(info100.startItem).toBe(1)
      expect(info100.endItem).toBe(100)
      expect(info100.totalPages).toBe(1)
    })

    it('handles single item total', () => {
      const info = getPaginationInfo(0, 50, 1)
      expect(info.startItem).toBe(1)
      expect(info.endItem).toBe(1)
      expect(info.totalPages).toBe(1)
      expect(info.hasNext).toBe(false)
      expect(info.hasPrevious).toBe(false)
    })

    it('handles zero items total', () => {
      const info = getPaginationInfo(0, 50, 0)
      expect(info.startItem).toBe(1)
      expect(info.endItem).toBe(0)
      expect(info.totalPages).toBe(0)
      expect(info.hasNext).toBe(false)
      expect(info.hasPrevious).toBe(false)
    })
  })

  describe('createPaginationParams', () => {
    it('creates params with default offset', () => {
      const params = createPaginationParams(50)
      expect(params).toEqual({ limit: 50, offset: 0 })
    })

    it('creates params with custom offset', () => {
      const params = createPaginationParams(50, 100)
      expect(params).toEqual({ limit: 50, offset: 100 })
    })

    it('handles different page sizes', () => {
      expect(createPaginationParams(25)).toEqual({ limit: 25, offset: 0 })
      expect(createPaginationParams(100)).toEqual({ limit: 100, offset: 0 })
    })

    it('handles different offsets', () => {
      expect(createPaginationParams(50, 0)).toEqual({ limit: 50, offset: 0 })
      expect(createPaginationParams(50, 50)).toEqual({ limit: 50, offset: 50 })
      expect(createPaginationParams(50, 100)).toEqual({ limit: 50, offset: 100 })
    })

    it('creates params matching React Query pattern', () => {
      const firstPage = createPaginationParams(50, 0)
      const secondPage = createPaginationParams(50, 50)
      const thirdPage = createPaginationParams(50, 100)

      expect(firstPage.offset).toBe(0)
      expect(secondPage.offset).toBe(50)
      expect(thirdPage.offset).toBe(100)
    })
  })

  describe('PageSize type', () => {
    it('accepts valid page sizes', () => {
      const size1: PageSize = 25
      const size2: PageSize = 50
      const size3: PageSize = 100

      expect(size1).toBe(25)
      expect(size2).toBe(50)
      expect(size3).toBe(100)
    })
  })
})
