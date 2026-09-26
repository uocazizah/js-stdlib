/**
 * Number specifier handlers: %d %i %u %f %F %e %E %g %G %x %X %o
 */

import type { FormatSpecifier, SpecifierHandler } from '../../utils/types.js'

/** Check if value is a number-like (number or bigint) */
function isNumberLike(value: unknown): value is number | bigint {
  return typeof value === 'number' || typeof value === 'bigint'
}

/** Convert value to number, handling bigint */
function toNumber(value: unknown): number {
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return Number(value)
}

/** Handle integer specifiers: d, i, u, x, X, o */
function handleInteger(
  value: unknown,
  spec: FormatSpecifier,
  base: 10 | 16 | 8,
  unsigned: boolean
): string {
  if (!isNumberLike(value)) {
    value = Number(value)
  }

  let num: bigint
  if (typeof value === 'bigint') {
    num = value
  } else {
    num = BigInt(Math.trunc(toNumber(value)))
  }

  let isNegative = false
  if (unsigned) {
    // For unsigned, convert to 32-bit unsigned representation
    if (num < 0n) {
      num = (num & 0xFFFFFFFFn) >> 0n
    }
  } else {
    isNegative = num < 0n
    if (isNegative) {
      num = -num
    }
  }

  // Build the digit string
  let digits = num.toString(base)
  if (base === 16 && spec.specifier === 'X') {
    digits = digits.toUpperCase()
  }

  // Apply precision (minimum digits)
  if (spec.precision !== undefined && spec.precision !== '*') {
    digits = digits.padStart(spec.precision, '0')
  }

  // Build prefix for hash flag
  let prefix = ''
  if (spec.flags.hash) {
    switch (spec.specifier) {
      case 'x':
        prefix = '0x'
        break
      case 'X':
        prefix = '0X'
        break
      case 'o':
        if (digits[0] !== '0') prefix = '0'
        break
    }
  }

  // Determine sign
  let sign = ''
  if (isNegative) {
    sign = '-'
  } else if (spec.flags.plus) {
    sign = '+'
  } else if (spec.flags.space) {
    sign = ' '
  }

  // Calculate the length of sign + prefix + digits
  const content = sign + prefix + digits
  const width = spec.width as number

  // Apply width padding
  if (content.length < width) {
    const padding = width - content.length
    const padChar = spec.flags.zero && !spec.flags.minus ? '0' : ' '

    if (spec.flags.minus) {
      // Left align: sign + prefix + digits + padding
      return content + padChar.repeat(padding)
    } else if (spec.flags.zero) {
      // Zero pad: sign + prefix + zeros + digits
      return sign + prefix + padChar.repeat(padding) + digits
    } else {
      // Space pad: spaces + sign + prefix + digits
      return padChar.repeat(padding) + content
    }
  }

  return content
}

/** Handle floating-point specifiers: f, F, e, E, g, G */
function handleFloat(
  value: unknown,
  spec: FormatSpecifier,
  uppercase: boolean
): string {
  if (!isNumberLike(value)) {
    value = Number(value)
  }

  const num = toNumber(value)
  const isNegative = num < 0 || Object.is(num, -0)
  const absNum = Math.abs(num)

  let digits: string
  const precision = typeof spec.precision === 'number' ? spec.precision : 6

  switch (spec.specifier) {
    case 'f':
    case 'F':
      digits = absNum.toFixed(precision)
      break
    case 'e':
    case 'E':
      digits = absNum.toExponential(precision)
      break
    case 'g':
    case 'G': {
      // General format: use fixed or exponential whichever is shorter
      // Precision for %g is significant digits (default 6)
      // Trailing zeros are removed, decimal point removed if no fractional part
      const effectivePrecision = precision === 0 ? 1 : precision
      const expStr = absNum.toExponential(effectivePrecision - 1)
      const fixedStr = absNum.toPrecision(effectivePrecision)
      // Remove trailing zeros and potential trailing decimal point
      let trimmedFixed = fixedStr.replace(/\.?0+$/, '')
      // If the result is in exponential notation, also trim trailing zeros from mantissa
      if (trimmedFixed.includes('e')) {
        const parts = trimmedFixed.split('e')
        const mantissa = parts[0]!
        const exponent = parts[1]!
        const trimmedMantissa = mantissa.replace(/\.?0+$/, '')
        trimmedFixed = trimmedMantissa + 'e' + exponent
      }
      digits = trimmedFixed.length <= expStr.length ? trimmedFixed : expStr
      break
    }
    default:
      digits = absNum.toString()
  }

  if (uppercase) {
    digits = digits.toUpperCase()
  }

  // Handle NaN and Infinity
  if (!isFinite(absNum) || isNaN(absNum)) {
    digits = isNaN(absNum) ? 'nan' : 'inf'
    if (uppercase) digits = digits.toUpperCase()
  }

  // Build prefix for hash flag (force decimal point)
  let prefix = ''
  if (spec.flags.hash) {
    if (!digits.includes('.') && !digits.includes('e') && !digits.includes('E') && !digits.includes('n')) {
      prefix = '.'
    }
  }

  // Determine sign
  let sign = ''
  if (isNegative) {
    sign = '-'
  } else if (spec.flags.plus) {
    sign = '+'
  } else if (spec.flags.space) {
    sign = ' '
  }

  // For floats with hash, the prefix (.) goes after digits
  const content = sign + digits + prefix
  const width = spec.width as number

  // Apply width padding
  if (content.length < width) {
    const padding = width - content.length
    const padChar = spec.flags.zero && !spec.flags.minus ? '0' : ' '

    if (spec.flags.minus) {
      return content + padChar.repeat(padding)
    } else if (spec.flags.zero) {
      return sign + padChar.repeat(padding) + digits + prefix
    } else {
      return padChar.repeat(padding) + content
    }
  }

  return content
}

/** Integer handlers */
export const integerHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  const unsigned = spec.specifier === 'u'
  const base = spec.specifier === 'x' || spec.specifier === 'X' ? 16 :
               spec.specifier === 'o' ? 8 : 10
  const formatted = handleInteger(value, spec, base, unsigned)
  return { formatted, nextArgIndex: 1 }
}

/** Float handlers */
export const floatHandler: SpecifierHandler = (value: unknown, spec: FormatSpecifier) => {
  const uppercase = spec.specifier === spec.specifier.toUpperCase()
  const formatted = handleFloat(value, spec, uppercase)
  return { formatted, nextArgIndex: 1 }
}

/** Specifier registry for number types */
export const numberSpecifiers: Record<string, SpecifierHandler> = {
  d: integerHandler,
  i: integerHandler,
  u: integerHandler,
  f: floatHandler,
  F: floatHandler,
  e: floatHandler,
  E: floatHandler,
  g: floatHandler,
  G: floatHandler,
  x: integerHandler,
  X: integerHandler,
  o: integerHandler,
}