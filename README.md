# js-stdlib

A modern JavaScript/TypeScript standard library with full C-style `printf` formatting support.

## Features

- **Full C-style printf** - Supports `%d`, `%i`, `%u`, `%f`, `%e`, `%g`, `%x`, `%o`, `%s`, `%c`, `%p`, `%j`, `%%` with all flags, width, precision, and length modifiers
- **Multi-format output** - Builds to ESM (`.mjs`), CJS (`.js`), and TypeScript declarations (`.d.ts`)
- **NodeNext/Node16 modules** - Native Node.js module resolution with explicit extensions
- **Subpath exports** - Import only what you need: `import { printf } from 'js-stdlib/io'`
- **Zero-config build** - Powered by `tsup` (esbuild)
- **Extensible** - Custom specifier registry for domain-specific formatting

## Installation

```bash
npm install js-stdlib
```

## Quick Start

```typescript
import { printf, sprintf } from 'js-stdlib/io'

// Print directly to stdout
printf('Hello %s, you are %d years old!\n', 'Alice', 30)
// Output: Hello Alice, you are 30 years old!

// Format to string
const message = sprintf('Score: %+.2f%%', 99.5)
// message = "Score: +99.50%"

// Format JSON safely (handles circular refs)
const obj = { name: 'test' }
obj.self = obj
sprintf('%j', obj)  // '{"name":"test","self":[Circular]}'
```

## Supported Format Specifiers

| Specifier | Description | Example |
|-----------|-------------|---------|
| `%d`, `%i` | Signed decimal integer | `%d` → `42`, `-42` |
| `%u` | Unsigned decimal integer | `%u` → `42` |
| `%f`, `%F` | Fixed-point decimal | `%.2f` → `3.14` |
| `%e`, `%E` | Scientific notation | `%e` → `1.23e+2` |
| `%g`, `%G` | General format (shortest) | `%g` → `3.14` or `1e+6` |
| `%x`, `%X` | Hexadecimal (lower/upper) | `%x` → `ff`, `%X` → `FF` |
| `%o` | Octal | `%o` → `10` |
| `%s` | String | `%s` → `hello` |
| `%c` | Character | `%c` → `A` (from 65) |
| `%p` | Pointer/Object inspection | `%p` → `{ a: 1 }` |
| `%j` | JSON (circular-safe) | `%j` → `{"a":1}` |
| `%%` | Literal percent sign | `%%` → `%` |

### Flags

| Flag | Description |
|------|-------------|
| `-` | Left-align |
| `+` | Always show sign |
| ` ` | Space prefix for positive |
| `#` | Alternate form (0x, 0X, 0, .0) |
| `0` | Zero-pad |

### Width & Precision

```typescript
sprintf('%10s', 'hi')        // '        hi' (width)
sprintf('%-10s', 'hi')       // 'hi        ' (left-align)
sprintf('%010d', 42)         // '0000000042' (zero-pad)
sprintf('%.2f', 3.14159)     // '3.14' (precision)
sprintf('%10.2f', 3.14159)   // '      3.14' (width + precision)
sprintf('%*s', 10, 'hi')     // '        hi' (dynamic width)
sprintf('%.*s', 3, 'hello')  // 'hel' (dynamic precision)
```

### Length Modifiers

| Modifier | Types |
|----------|-------|
| `hh` | `Int8`, `Uint8` |
| `h` | `Int16`, `Uint16` |
| `l` | `Int32`, `Uint32` |
| `ll` | `BigInt` |
| `j` | `intmax_t` / `BigInt` |
| `z` | `size_t` / `number` |
| `t` | `ptrdiff_t` / `number` |
| `L` | `long double` / `number` |

### Positional Arguments

```typescript
sprintf('%2$s %1$s', 'world', 'hello')  // 'hello world'
```

## API

### `printf(format, ...args)`
Print to stdout, returns characters written.

### `sprintf(format, args, options?)`
Format to string.

### `fprintf(stream, format, ...args)`
Print to writable stream (e.g., `process.stderr`).

### `createPrintf(defaultOptions)`
Create a custom printf with default options.

### Options
```typescript
interface PrintfOptions {
  customSpecifiers?: Record<string, SpecifierHandler>
  write?: (str: string) => void
}
```

## Import Patterns

```typescript
// Import everything
import { printf, sprintf } from 'js-stdlib'

// Import only I/O (tree-shakeable)
import { printf, sprintf } from 'js-stdlib/io'

// Import types
import type { PrintfOptions, FormatSpecifier } from 'js-stdlib/io'
```

## Building

```bash
npm run build    # Build all formats to dist/
npm run dev      # Watch mode
npm run typecheck # Type-check only
npm test         # Run tests
```

## Output Structure

```
dist/
├── index.d.ts      # Main types
├── index.js        # CJS bundle
├── index.mjs       # ESM bundle
├── io/
│   ├── index.d.ts  # I/O types
│   ├── index.js    # I/O CJS
│   └── index.mjs   # I/O ESM
```

## Requirements

- Node.js 18+
- TypeScript 5.3+ (for development)

## License

MIT