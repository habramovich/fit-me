// Generates the PWA icons in public/icons/ (no dependencies): a light figure with raised arms on
// the FitMe green. Run: node scripts/make-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BG = [0x2f, 0x6f, 0x5e]
const FG = [0xf6, 0xf4, 0xef]

// Shapes in unit coordinates (0..1). Segments are round-capped strokes.
const head = { x: 0.5, y: 0.27, r: 0.075 }
const segments = [
  { a: [0.5, 0.37], b: [0.5, 0.6], w: 0.095 }, // torso
  { a: [0.5, 0.42], b: [0.33, 0.24], w: 0.055 }, // arms raised
  { a: [0.5, 0.42], b: [0.67, 0.24], w: 0.055 },
  { a: [0.5, 0.6], b: [0.39, 0.8], w: 0.065 }, // legs
  { a: [0.5, 0.6], b: [0.61, 0.8], w: 0.065 },
]

function distToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

// Signed distance (negative inside) to the union of shapes.
function sdf(x, y) {
  let d = Math.hypot(x - head.x, y - head.y) - head.r
  for (const s of segments) d = Math.min(d, distToSegment(x, y, s.a, s.b) - s.w / 2)
  return d
}

function crc32(buf) {
  let c = ~0
  for (const byte of buf) {
    c ^= byte
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const d = sdf((x + 0.5) / size, (y + 0.5) / size) * size
      const a = Math.max(0, Math.min(1, 0.5 - d)) // 1px anti-aliasing
      const o = y * (size * 3 + 1) + 1 + x * 3
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(BG[i] + (FG[i] - BG[i]) * a)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
// Full-bleed background, figure inside the central 80%, so one image works as maskable too.
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(`public/icons/${name}`, png(size))
  console.log(`public/icons/${name}`)
}

const svgSegments = segments
  .map(
    (s) =>
      `<line x1="${s.a[0] * 64}" y1="${s.a[1] * 64}" x2="${s.b[0] * 64}" y2="${s.b[1] * 64}" stroke-width="${s.w * 64}"/>`,
  )
  .join('')
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2F6F5E"/><g stroke="#F6F4EF" stroke-linecap="round">${svgSegments}</g><circle cx="${head.x * 64}" cy="${head.y * 64}" r="${head.r * 64}" fill="#F6F4EF"/></svg>\n`,
)
console.log('public/favicon.svg')
