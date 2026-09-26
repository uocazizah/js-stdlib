/**
 * Specifier registry - combines all specifier handlers
 */

import type { SpecifierRegistry } from '../../utils/types.js'
import { numberSpecifiers } from './number.js'
import { stringSpecifiers } from './string.js'
import { jsonSpecifiers } from './json.js'
import { pointerSpecifiers } from './pointer.js'

/** Built-in specifier handlers */
export const builtinSpecifiers: SpecifierRegistry = {
  ...numberSpecifiers,
  ...stringSpecifiers,
  ...jsonSpecifiers,
  ...pointerSpecifiers,
  // Literal percent
  '%': () => ({ formatted: '%', nextArgIndex: 0 }),
}

/** Create a combined registry with custom specifiers */
export function createSpecifierRegistry(
  customSpecifiers?: SpecifierRegistry
): SpecifierRegistry {
  if (!customSpecifiers) return { ...builtinSpecifiers }
  return { ...builtinSpecifiers, ...customSpecifiers }
}