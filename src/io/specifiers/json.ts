/**
 * JSON specifier handler: %j
 * Circular-safe JSON serialization
 */

import type { FormatSpecifier, SpecifierHandler } from '../../utils/types.js'

/** WeakMap to track visited objects during serialization */
const visited = new WeakMap<object, boolean>()

/** Circular-safe JSON stringify */
function safeStringify(value: unknown, indent?: number): string {
  const seen = new WeakSet<object>()

  function stringify(val: unknown, depth: number): string {
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'

    const type = typeof val
    if (type === 'string') return JSON.stringify(val)
    if (type === 'number' || type === 'boolean' || type === 'bigint') return String(val)
    if (type === 'symbol') return val.toString()
    if (type === 'function') {
      const func = val as { name?: string }
      return `[Function: ${func.name || 'anonymous'}]`
    }

    // Handle arrays first (before object check)
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]'
      const items = val.map(v => stringify(v, depth + 1))
      if (indent) {
        const joiner = `,\n${' '.repeat(indent * (depth + 1))}`
        const prefix = `\n${' '.repeat(indent * (depth + 1))}`
        const suffix = `\n${' '.repeat(indent * depth)}`
        return `[${prefix}${items.join(joiner)}${suffix}]`
      } else {
        return `[${items.join(',')}]`
      }
    }

    // Handle objects
    if (seen.has(val as object)) return '[Circular]'
    seen.add(val as object)

    try {
      // Handle special objects
      if (val instanceof Date) return val.toISOString()
      if (val instanceof RegExp) return val.toString()
      if (val instanceof Error) return `{ message: ${JSON.stringify(val.message)}, name: ${JSON.stringify(val.name)} }`
      if (val instanceof Map) {
        const entries = [...val.entries()].map(([k, v]) =>
          `${stringify(k, depth + 1)} => ${stringify(v, depth + 1)}`
        )
        return `Map { ${entries.join(', ')} }`
      }
      if (val instanceof Set) {
        const values = [...val].map(v => stringify(v, depth + 1))
        return `Set { ${values.join(', ')} }`
      }
      if (val instanceof WeakMap) return 'WeakMap { <items unknown> }'
      if (val instanceof WeakSet) return 'WeakSet { <items unknown> }'
      if (val instanceof Promise) return 'Promise { <pending> }'
      if (val instanceof ArrayBuffer) return `ArrayBuffer { byteLength: ${val.byteLength} }`
      if (ArrayBuffer.isView(val)) {
      const view = val as ArrayBufferView
      return `${val.constructor.name} { length: ${view.byteLength} }`
    }

      // Plain object
      const keys = Object.keys(val as object)
      if (keys.length === 0) return '{}'

      const pairs = keys.map(key => {
        const value = (val as Record<string, unknown>)[key]
        return `${JSON.stringify(key)}:${stringify(value, depth + 1)}`
      })
      if (indent) {
        const joiner = `,\n${' '.repeat(indent * (depth + 1))}`
        const prefix = `\n${' '.repeat(indent * (depth + 1))}`
        const suffix = `\n${' '.repeat(indent * depth)}`
        return `{${prefix}${pairs.join(joiner)}${suffix}}`
      } else {
        return `{${pairs.join(',')}}`
      }
    } finally {
      seen.delete(val as object)
    }
  }

  return stringify(value, 0)
}

/** Handle %j - JSON */
export const jsonHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  const indent = typeof spec.precision === 'number' && spec.precision > 0 ? spec.precision : undefined
  let str = safeStringify(value, indent)

  // Apply width and flags
  const width = spec.width as number
  const { minus } = spec.flags

  if (str.length < width) {
    const padding = ' '.repeat(width - str.length)
    str = minus ? str + padding : padding + str
  }

  return { formatted: str, nextArgIndex: 1 }
}

/** Specifier registry for JSON */
export const jsonSpecifiers: Record<string, SpecifierHandler> = {
  j: jsonHandler,
}