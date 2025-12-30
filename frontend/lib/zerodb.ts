const ZERODB_API_BASE = process.env.NEXT_PUBLIC_ZERODB_API_BASE || 'https://api.zerodb.io'
const ZERODB_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODB_PROJECT_ID || ''
const ZERODB_API_KEY = process.env.NEXT_PUBLIC_ZERODB_API_KEY || ''

export interface ZeroDBTableRow {
  [key: string]: any
}

export interface ZeroDBInsertResponse {
  success: boolean
  row_ids?: string[]
  error?: string
}

export interface ZeroDBQueryResponse<T = ZeroDBTableRow> {
  success: boolean
  rows?: T[]
  total?: number
  error?: string
}

export class ZeroDBClient {
  private baseUrl: string
  private projectId: string
  private apiKey: string

  constructor() {
    this.baseUrl = ZERODB_API_BASE
    this.projectId = ZERODB_PROJECT_ID
    this.apiKey = ZERODB_API_KEY
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    }
  }

  async insertRows<T extends ZeroDBTableRow>(
    tableName: string,
    rows: T[]
  ): Promise<ZeroDBInsertResponse> {
    const url = `${this.baseUrl}/${this.projectId}/database/tables/${tableName}/rows`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ rows })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ZeroDB insert error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async queryRows<T extends ZeroDBTableRow>(
    tableName: string,
    options?: {
      filter?: Record<string, any>
      limit?: number
      offset?: number
      sort?: Record<string, 1 | -1>
    }
  ): Promise<ZeroDBQueryResponse<T>> {
    const url = `${this.baseUrl}/${this.projectId}/database/tables/${tableName}/rows`
    const params = new URLSearchParams()

    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())
    if (options?.filter) params.append('filter', JSON.stringify(options.filter))
    if (options?.sort) params.append('sort', JSON.stringify(options.sort))

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ZeroDB query error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async embedAndStore(request: EmbedAndStoreRequest): Promise<EmbedAndStoreResponse> {
    const url = `${this.baseUrl}/${this.projectId}/embeddings/embed-and-store`

    const payload = {
      documents: request.documents,
      namespace: request.namespace,
      model: request.model || 'BAAI/bge-small-en-v1.5'
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ZeroDB embed-and-store error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export interface EmbeddingDocument {
  id: string
  text: string
  metadata?: Record<string, any>
}

export interface EmbedAndStoreRequest {
  documents: EmbeddingDocument[]
  namespace: string
  model?: string
}

export interface EmbedAndStoreResponse {
  success: boolean
  embedding_ids?: string[]
  error?: string
}

export const zeroDBClient = new ZeroDBClient()
