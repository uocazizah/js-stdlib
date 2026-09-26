/**
 * Tests for printf implementation
 */

import { describe, it, expect } from 'vitest'
import { sprintf, printf, fprintf } from '../../src/io/printf.js'

describe('sprintf', () => {
  describe('Basic specifiers', () => {
    it('formats strings with %s', () => {
      expect(sprintf('Hello %s', ['world'])).toBe('Hello world')
    })

    it('formats numbers with %d', () => {
      expect(sprintf('Number: %d', [42])).toBe('Number: 42')
    })

    it('formats negative numbers with %d', () => {
      expect(sprintf('Number: %d', [-42])).toBe('Number: -42')
    })

    it('formats unsigned with %u', () => {
      expect(sprintf('Unsigned: %u', [42])).toBe('Unsigned: 42')
      expect(sprintf('Unsigned: %u', [-1])).toBe('Unsigned: 4294967295')
    })

    it('formats hex with %x and %X', () => {
      expect(sprintf('Hex: %x', [255])).toBe('Hex: ff')
      expect(sprintf('Hex: %X', [255])).toBe('Hex: FF')
    })

    it('formats octal with %o', () => {
      expect(sprintf('Octal: %o', [8])).toBe('Octal: 10')
    })

    it('formats characters with %c', () => {
      expect(sprintf('Char: %c', [65])).toBe('Char: A')
      expect(sprintf('Char: %c', ['Z'])).toBe('Char: Z')
    })

    it('formats literal %%', () => {
      expect(sprintf('100%%', [])).toBe('100%')
    })
  })

  describe('Floating point', () => {
    it('formats with %f', () => {
      expect(sprintf('Float: %f', [3.14159])).toBe('Float: 3.141590')
    })

    it('formats with precision %.2f', () => {
      expect(sprintf('Float: %.2f', [3.14159])).toBe('Float: 3.14')
    })

    it('formats scientific with %e', () => {
      expect(sprintf('Sci: %e', [1000])).toBe('Sci: 1.000000e+3')
    })

    it('formats scientific uppercase with %E', () => {
      expect(sprintf('Sci: %E', [1000])).toBe('Sci: 1.000000E+3')
    })

    it('formats general with %g', () => {
      expect(sprintf('Gen: %g', [3.14])).toBe('Gen: 3.14')
      expect(sprintf('Gen: %g', [1000000])).toBe('Gen: 1e+6')
    })
  })

  describe('Flags', () => {
    it('left-align with %-', () => {
      expect(sprintf('|%-10s|', ['hello'])).toBe('|hello     |')
    })

    it('right-align with %10s', () => {
      expect(sprintf('|%10s|', ['hello'])).toBe('|     hello|')
    })

    it('zero-pad with %0', () => {
      expect(sprintf('|%010d|', [42])).toBe('|0000000042|')
    })

    it('show sign with %+', () => {
      expect(sprintf('%+d', [42])).toBe('+42')
      expect(sprintf('%+d', [-42])).toBe('-42')
    })

    it('space prefix with % d', () => {
      expect(sprintf('% d', [42])).toBe(' 42')
      expect(sprintf('% d', [-42])).toBe('-42')
    })

    it('alternate form with %#', () => {
      expect(sprintf('%#x', [255])).toBe('0xff')
      expect(sprintf('%#X', [255])).toBe('0XFF')
      expect(sprintf('%#o', [8])).toBe('010')
      expect(sprintf('%#f', [3.0])).toBe('3.000000')
    })

    it('combines flags', () => {
      expect(sprintf('%+010d', [42])).toBe('+000000042')
      expect(sprintf('%-+10d', [42])).toBe('+42       ')
    })
  })

  describe('Width and precision', () => {
    it('handles width', () => {
      expect(sprintf('|%10s|', ['hi'])).toBe('|        hi|')
    })

    it('handles precision for strings', () => {
      expect(sprintf('%.3s', ['hello'])).toBe('hel')
    })

    it('handles precision for numbers', () => {
      expect(sprintf('%.5d', [42])).toBe('00042')
    })

    it('handles * for width', () => {
      expect(sprintf('%*s', [10, 'hi'])).toBe('        hi')
    })

    it('handles * for precision', () => {
      expect(sprintf('%.*s', [3, 'hello'])).toBe('hel')
    })

    it('handles * for both', () => {
      expect(sprintf('%*.*s', [10, 3, 'hello'])).toBe('       hel')
    })
  })

  describe('Length modifiers', () => {
    it('handles bigint with %d', () => {
      expect(sprintf('%d', [9007199254740991n])).toBe('9007199254740991')
    })

    it('handles bigint with %x', () => {
      expect(sprintf('%x', [255n])).toBe('ff')
    })
  })

  describe('JSON specifier %j', () => {
    it('formats objects', () => {
      expect(sprintf('%j', [[{ a: 1 }]])).toBe('[{"a":1}]')
    })

    it('formats with indentation', () => {
      const result = sprintf('%.2j', [{ a: 1 }])
      expect(result).toContain('\n')
      expect(result).toContain('  ')
    })

    it('handles circular references', () => {
      const obj: Record<string, unknown> = { a: 1 }
      obj.self = obj
      expect(sprintf('%j', [obj])).toContain('[Circular]')
    })

    it('handles special objects', () => {
      expect(sprintf('%j', [new Date('2024-01-01')])).toContain('2024-01-01')
      expect(sprintf('%j', [new Map([[1, 2]])])).toContain('Map')
      expect(sprintf('%j', [new Set([1, 2])])).toContain('Set')
    })
  })

  describe('Pointer specifier %p', () => {
    it('formats objects', () => {
      const result = sprintf('%p', [{ a: 1 }])
      expect(result).toContain('a')
      expect(result).toContain('1')
    })

    it('formats null and undefined', () => {
      expect(sprintf('%p', [null])).toBe('null')
      expect(sprintf('%p', [undefined])).toBe('undefined')
    })

    it('respects precision for depth', () => {
      const obj = { a: { b: { c: 1 } } }
      const shallow = sprintf('%.1p', [obj])
      const deep = sprintf('%.3p', [obj])
      // Depth=1 should show nested object as [Object], not expand it
      expect(shallow).toContain('[Object]')
      // Depth=3 should expand the nested object
      expect(deep).toContain('c: 1')
    })
  })

  describe('Positional arguments', () => {
    it('uses positional arguments', () => {
      expect(sprintf('%2$s %1$s', ['world', 'hello'])).toBe('hello world')
    })

    it('mixes positional and sequential', () => {
      expect(sprintf('%1$s %s %1$s', ['a', 'b'])).toBe('a b a')
    })

    it('throws on duplicate position', () => {
      expect(() => sprintf('%1$s %1$s', ['a'])).not.toThrow()
      // Actually this should work - same position used twice is valid
      expect(sprintf('%1$s %1$s', ['a'])).toBe('a a')
    })
  })

  describe('Edge cases', () => {
    it('handles null/undefined for %s', () => {
      expect(sprintf('%s', [null])).toBe('null')
      expect(sprintf('%s', [undefined])).toBe('undefined')
    })

    it('handles NaN and Infinity', () => {
      expect(sprintf('%f', [NaN])).toBe('nan')
      expect(sprintf('%f', [Infinity])).toBe('inf')
      expect(sprintf('%f', [-Infinity])).toBe('-inf')
    })

    it('throws on insufficient arguments', () => {
      expect(() => sprintf('%s %d', ['hello'])).toThrow('Insufficient arguments')
    })

    it('throws on invalid specifier', () => {
      expect(() => sprintf('%k', [])).toThrow('Invalid format specifier')
    })
  })

  describe('Custom specifiers', () => {
    it('allows custom specifiers', () => {
      const custom = {
        r: (value: unknown) => ({
          formatted: String(value).split('').reverse().join(''),
          nextArgIndex: 1,
        }),
      }
      expect(sprintf('%r', ['hello'], { customSpecifiers: custom })).toBe('olleh')
    })
  })
})

describe('printf', () => {
  it('writes to stdout and returns written count', () => {
    const originalWrite = process.stdout.write
    let output = ''
    process.stdout.write = (str: string) => {
      output += str
      return true
    }

    try {
      const written = printf('Hello %s\n', 'world')
      expect(output).toBe('Hello world\n')
      expect(written).toBe('Hello world\n'.length)
    } finally {
      process.stdout.write = originalWrite
    }
  })
})

describe('fprintf', () => {
  it('writes to stream', () => {
    const chunks: string[] = []
    const stream = {
      write: (chunk: string) => {
        chunks.push(chunk)
        return true
      },
    } as NodeJS.WritableStream

    const written = fprintf(stream, 'Hello %s', 'world')
    expect(chunks.join('')).toBe('Hello world')
    expect(written).toBe('Hello world'.length)
  })
})

import { parseFormatString } from '../../src/io/format.js'

describe('parseFormatString', () => {
  it('parses simple format', () => {
    const parts = parseFormatString('Hello %s')
    expect(parts).toEqual(['Hello ', expect.objectContaining({ specifier: 's' })])
  })

  it('parses complex format', () => {
    const parts = parseFormatString('%+010.2f')
    const spec = parts[0] as any
    expect(spec.flags.plus).toBe(true)
    expect(spec.flags.zero).toBe(true)
    expect(spec.width).toBe(10)
    expect(spec.precision).toBe(2)
    expect(spec.specifier).toBe('f')
  })

  it('parses positional', () => {
    const parts = parseFormatString('%2$d %1$s')
    expect((parts[0] as any).position).toBe(2)
    expect((parts[2] as any).position).toBe(1)
  })
})