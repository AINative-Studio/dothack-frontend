/**
 * ZeroDB Client stub — re-exports from zerodb.ts for backward compatibility.
 * New code should use lib/api/client.ts to call the DotHack backend API directly.
 */
import { ZeroDBClient } from './zerodb'

export const zeroDBClient = new ZeroDBClient()
export { ZeroDBClient }
