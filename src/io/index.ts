/**
 * I/O Module - printf and formatting utilities
 */

export {
  sprintf,
  printf,
  fprintf,
  createPrintf,
} from './printf.js'

export type {
  PrintfOptions,
  PrintfResult,
} from '../utils/types.js'

export {
  parseFormatString,
} from './format.js'

export {
  builtinSpecifiers,
  createSpecifierRegistry,
} from './specifiers/index.js'

export type {
  FormatSpecifier,
  FormatFlags,
  LengthModifier,
  SpecifierType,
  SpecifierHandler,
  SpecifierRegistry,
} from '../utils/types.js'