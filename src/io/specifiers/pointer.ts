/**
 * Pointer specifier handler: %p
 * Uses Node.js util.inspect for object representation
 */

import type { FormatSpecifier, SpecifierHandler } from '../../utils/types.js'
import { inspect } from 'node:util'

/** Handle %p - pointer/object inspection */
export const pointerHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  let str: string

  if (value === null) {
    str = 'null'
  } else if (value === undefined) {
    str = 'undefined'
  } else if (typeof value === 'object' || typeof value === 'function') {
    // Use Node's inspect with depth based on precision
    const depth = typeof spec.precision === 'number' && spec.precision > 0 ? spec.precision : 2
    str = inspect(value, {
      depth,
      colors: false,
      compact: true,
      breakLength: Infinity,
    })
  } else {
    // Primitive values
    str = String(value)
  }

  // Apply width and flags
  const width = spec.width as number
  const { minus } = spec.flags

  if (str.length < width) {
    const padding = ' '.repeat(width - str.length)
    str = minus ? str + padding : padding + str
  }

  return { formatted: str, nextArgIndex: 1 }
}

/** Specifier registry for pointer */
export const pointerSpecifiers: Record<string, SpecifierHandler> = {
  p: pointerHandler,
}