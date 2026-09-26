/**
 * Format string parser for printf-style formatting
 * Parses format strings like "%-10.2f", "%08x", "%2$d", etc.
 */

import type {
  FormatSpecifier,
  FormatFlags,
  LengthModifier,
  SpecifierType
} from '../utils/types.js'

/** Regex to match format specifiers - more permissive to allow custom specifiers */
const FORMAT_REGEX = /%(\d+\$)?([-+ #0]*)(\*|\d+)?(?:\.(\*|\d+))?([hlLjzt]|hh|ll)?(.)/g

/** Default flags */
const DEFAULT_FLAGS: FormatFlags = {
  minus: false,
  plus: false,
  space: false,
  hash: false,
  zero: false,
}

/**
 * Parse a format string into an array of format specifiers and literal text
 */
export function parseFormatString(format: string): (string | FormatSpecifier)[] {
  const parts: (string | FormatSpecifier)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex lastIndex
  FORMAT_REGEX.lastIndex = 0

  while ((match = FORMAT_REGEX.exec(format)) !== null) {
    // Add literal text before this specifier
    if (match.index > lastIndex) {
      parts.push(format.slice(lastIndex, match.index))
    }

    const [raw, positionStr, flagsStr = '', widthStr, precisionStr, lengthStr, specifier] = match

    // Parse position (e.g., "2$")
    const position = positionStr ? parseInt(positionStr.slice(0, -1), 10) : undefined

    // Parse flags
    const flags: FormatFlags = { ...DEFAULT_FLAGS }
    for (const ch of flagsStr) {
      switch (ch) {
        case '-': flags.minus = true; break
        case '+': flags.plus = true; break
        case ' ': flags.space = true; break
        case '#': flags.hash = true; break
        case '0': flags.zero = true; break
      }
    }

    // Parse width
    let width: number | '*' = 0
    if (widthStr === '*') {
      width = '*'
    } else if (widthStr) {
      width = parseInt(widthStr, 10)
    }

    // Parse precision
    let precision: number | '*' | undefined
    if (precisionStr === '*') {
      precision = '*'
    } else if (precisionStr !== undefined) {
      precision = parseInt(precisionStr, 10)
    }

    // Parse length modifier
    const length: LengthModifier = (lengthStr as LengthModifier) || ''

    const spec: FormatSpecifier = {
      raw,
      flags,
      width,
      precision,
      length,
      specifier: specifier as SpecifierType,
      position,
    }

    parts.push(spec)
    lastIndex = FORMAT_REGEX.lastIndex
  }

  // Add remaining literal text
  if (lastIndex < format.length) {
    parts.push(format.slice(lastIndex))
  }

  return parts
}

/**
 * Get the next argument index, handling positional and sequential arguments
 */
export function getNextArgIndex(
  spec: FormatSpecifier,
  currentIndex: number,
  args: unknown[],
  usedPositions: Set<number>
): number {
  if (spec.position !== undefined) {
    // Allow reuse of the same position - don't track used positions
    return spec.position - 1 // Convert to 0-based
  }
  return currentIndex
}

/**
 * Resolve width/precision from arguments if they are '*'
 */
export function resolveWidthPrecision(
  spec: FormatSpecifier,
  args: unknown[],
  argIndex: number
): { width: number; precision: number | undefined; nextArgIndex: number } {
  let nextIndex = argIndex
  let width = typeof spec.width === 'number' ? spec.width : 0
  let precision = typeof spec.precision === 'number' ? spec.precision : undefined

  if (spec.width === '*') {
    if (nextIndex >= args.length) throw new Error('Insufficient arguments for width')
    width = Math.floor(Number(args[nextIndex++]))
  }

  if (spec.precision === '*') {
    if (nextIndex >= args.length) throw new Error('Insufficient arguments for precision')
    precision = Math.floor(Number(args[nextIndex++]))
  }

  return { width, precision, nextArgIndex: nextIndex }
}