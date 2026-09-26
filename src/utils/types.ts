/**
 * Shared type definitions for js-stdlib
 */

/** Format specifier parsed from format string */
export interface FormatSpecifier {
  /** Original matched string (e.g., "%-10.2f") */
  raw: string
  /** Flags: '-', '+', ' ', '#', '0' */
  flags: FormatFlags
  /** Minimum field width (number or '*' for argument) */
  width: number | '*'
  /** Precision (number or '*' for argument) */
  precision: number | '*' | undefined
  /** Length modifier: 'hh', 'h', 'l', 'll', 'j', 'z', 't', 'L' */
  length: LengthModifier
  /** Conversion specifier: 'd', 'i', 'u', 'f', 'e', 'g', 'x', 'o', 's', 'c', 'p', 'j', '%' */
  specifier: SpecifierType
  /** Position for positional arguments (e.g., "%2$d") */
  position?: number
}

/** Format flags */
export interface FormatFlags {
  /** Left-justify */
  minus: boolean
  /** Always show sign */
  plus: boolean
  /** Space prefix for positive numbers */
  space: boolean
  /** Alternate form */
  hash: boolean
  /** Zero-pad */
  zero: boolean
}

/** Length modifiers */
export type LengthModifier = '' | 'hh' | 'h' | 'l' | 'll' | 'j' | 'z' | 't' | 'L'

/** Conversion specifiers */
export type SpecifierType =
  | 'd' | 'i'  // signed decimal
  | 'u'       // unsigned decimal
  | 'f' | 'F' // fixed-point
  | 'e' | 'E' // scientific
  | 'g' | 'G' // general
  | 'x' | 'X' // hex
  | 'o'       // octal
  | 's'       // string
  | 'c'       // character
  | 'p'       // pointer
  | 'j'       // JSON
  | '%'       // literal %

/** Specifier handler function */
export type SpecifierHandler = (
  value: unknown,
  spec: FormatSpecifier,
  args: unknown[],
  argIndex: number
) => { formatted: string; nextArgIndex: number }

/** Registry of specifier handlers */
export interface SpecifierRegistry {
  [key: string]: SpecifierHandler
}

/** printf options */
export interface PrintfOptions {
  /** Custom specifier handlers */
  customSpecifiers?: SpecifierRegistry
  /** Write function (default: process.stdout.write) */
  write?: (str: string) => void
}

/** Result of printf */
export interface PrintfResult {
  /** Formatted string */
  formatted: string
  /** Number of characters written */
  written: number
}