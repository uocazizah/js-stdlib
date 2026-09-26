/**
 * Core printf implementation
 * Supports full C-style format specifiers with extensions
 */

import type {
  FormatSpecifier,
  PrintfOptions,
  PrintfResult,
  SpecifierRegistry,
} from '../utils/types.js'
import { parseFormatString, getNextArgIndex, resolveWidthPrecision } from './format.js'
import { builtinSpecifiers, createSpecifierRegistry } from './specifiers/index.js'

/**
 * Format a string using printf-style formatting
 * @param format - Format string (e.g., "Hello %s, you are %d years old")
 * @param args - Arguments to format
 * @param options - Optional configuration
 * @returns Formatted string
 */
export function sprintf(
  format: string,
  args: unknown[],
  options?: PrintfOptions
): string {
  const { formatted } = printfInternal(format, args, options)
  return formatted
}

/**
 * Print formatted string to stdout (or custom write function)
 * @param format - Format string
 * @param args - Arguments to format
 * @param options - Optional configuration
 * @returns Number of characters written
 */
export function printf(
  format: string,
  ...args: unknown[]
): number {
  const options = args[args.length - 1] as PrintfOptions | undefined
  const actualArgs = options?.write || options?.customSpecifiers ? args.slice(0, -1) : args
  const { written } = printfInternal(format, actualArgs, options)
  return written
}

/**
 * Print formatted string to a stream
 * @param stream - Writable stream (e.g., process.stdout, process.stderr)
 * @param format - Format string
 * @param args - Arguments to format
 * @returns Number of characters written
 */
export function fprintf(
  stream: NodeJS.WritableStream,
  format: string,
  ...args: unknown[]
): number {
  let written = 0
  const write = (str: string) => {
    stream.write(str)
    written += str.length
  }
  printfInternal(format, args, { write })
  return written
}

/**
 * Internal printf implementation
 */
function printfInternal(
  format: string,
  args: unknown[],
  options?: PrintfOptions
): PrintfResult {
  const write = options?.write ?? ((str: string) => process.stdout.write(str))
  const specifiers = createSpecifierRegistry(options?.customSpecifiers)

  const parts = parseFormatString(format)
  let result = ''
  let argIndex = 0

  for (const part of parts) {
    if (typeof part === 'string') {
      // Literal text
      result += part
      write(part)
      continue
    }

    const spec = part

    // Check for invalid specifiers early (before consuming arguments for width/precision)
    const builtinSpecifiers = ['d', 'i', 'u', 'f', 'F', 'e', 'E', 'g', 'G', 'x', 'X', 'o', 's', 'c', 'p', 'j', '%']
    const isBuiltin = builtinSpecifiers.includes(spec.specifier)
    const hasCustomHandler = specifiers[spec.specifier] !== undefined

    if (!isBuiltin && !hasCustomHandler) {
      throw new Error(`Invalid format specifier: %${spec.specifier}`)
    }

    // Resolve argument index
    argIndex = getNextArgIndex(spec, argIndex, args, new Set())

    // Resolve width/precision from arguments if '*'
    const { width, precision, nextArgIndex } = resolveWidthPrecision(spec, args, argIndex)
    argIndex = nextArgIndex

    // Get the value argument
    if (argIndex >= args.length && spec.specifier !== '%') {
      throw new Error(`Insufficient arguments for format specifier: ${spec.raw}`)
    }

    const value = spec.specifier !== '%' ? args[argIndex] : undefined

    // Create resolved spec with actual width/precision
    const resolvedSpec: FormatSpecifier = {
      ...spec,
      width,
      precision,
    }

    // Find and call handler
    const handler = specifiers[spec.specifier]
    if (!handler) {
      throw new Error(`Unsupported format specifier: %${spec.specifier}`)
    }

    const { formatted: formattedValue, nextArgIndex: handlerNextIndex } = handler(
      value,
      resolvedSpec,
      args,
      argIndex
    )

    result += formattedValue
    write(formattedValue)
    argIndex += handlerNextIndex
  }

  return { formatted: result, written: result.length }
}

/**
 * Create a custom printf with default options
 */
export function createPrintf(defaultOptions: PrintfOptions) {
  return {
    sprintf: (format: string, ...args: unknown[]) =>
      sprintf(format, args, defaultOptions),
    printf: (format: string, ...args: unknown[]) =>
      printf(format, ...args, defaultOptions),
    fprintf: (stream: NodeJS.WritableStream, format: string, ...args: unknown[]) =>
      fprintf(stream, format, ...args, defaultOptions),
  }
}

/** Default export with all functions */
export default {
  sprintf,
  printf,
  fprintf,
  createPrintf,
}