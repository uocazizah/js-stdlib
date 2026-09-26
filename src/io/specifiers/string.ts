/**
 * String specifier handlers: %s %c
 */

import type { FormatSpecifier, SpecifierHandler } from '../../utils/types.js'

/** Handle %s - string */
export const stringHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  let str: string

  if (value === null) {
    str = 'null'
  } else if (value === undefined) {
    str = 'undefined'
  } else if (typeof value === 'symbol') {
    str = value.toString()
  } else {
    str = String(value)
  }

  // Apply precision (max length)
  if (spec.precision !== undefined && spec.precision !== '*') {
    str = str.slice(0, spec.precision)
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

/** Handle %c - character */
export const charHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  let ch: string

  if (typeof value === 'number') {
    // Handle Unicode code point
    if (value < 0 || value > 0x10FFFF || !Number.isInteger(value)) {
      ch = '\uFFFD' // Replacement character
    } else {
      ch = String.fromCodePoint(value)
    }
  } else if (typeof value === 'string') {
    ch = value[0] || ''
  } else {
    ch = String(value)[0] || ''
  }

  // Apply width (character specifiers don't use precision)
  const width = spec.width as number
  const { minus } = spec.flags

  let formatted = ch
  if (formatted.length < width) {
    const padding = ' '.repeat(width - formatted.length)
    formatted = minus ? formatted + padding : padding + formatted
  }

  return { formatted, nextArgIndex: 1 }
}

/** Specifier registry for string types */
export const stringSpecifiers: Record<string, SpecifierHandler> = {
  s: stringHandler,
  c: charHandler,
}