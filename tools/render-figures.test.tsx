// Dev tool: renders every exercise figure at each key pose to PNG for visual checking.
//   npm run render:figures            → all exercises
//   FIGURES=hip-circles,dead-bug npm run render:figures
//   STYLE=doodle npm run render:figures  → figure-renders/<id>-doodle.png
// Output: figure-renders/<id>.png (git-ignored). Rows = distinct figures (easier/standard/harder),
// columns = key poses, each showing the arrows for the move that starts there.
// It draws the real <Figure> markup with a tiny SVG rasterizer (line, circle, rect, path with
// M/L/H/V/Q/A/Z), so what you see is what the app draws, minus dashes and text.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { renderToStaticMarkup } from 'react-dom/server'
import { it } from 'vitest'
import { allExercises } from '../src/exercises'
import type { FigureSpec } from '../src/exercises/types'
import { Figure } from '../src/figure/Figure'
import type { FigureStyle } from '../src/figure/style'

const OUT = 'figure-renders'
const SCALE = 2
const TW = 250 * SCALE
const TH = 180 * SCALE
const GAP = 8

type RGB = [number, number, number]
type Pt = [number, number]
interface Stroke {
  kind: 'stroke'
  pts: Pt[]
  width: number
  color: RGB
  alpha: number
}
interface Fill {
  kind: 'fill'
  poly?: Pt[]
  circle?: { c: Pt; r: number }
  rect?: { x: number; y: number; w: number; h: number }
  color: RGB
  alpha: number
}
type Shape = Stroke | Fill

// CSS variables from the app's stylesheet.
const vars: Record<string, string> = {}
for (const m of readFileSync('src/index.css', 'utf8').matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g))
  vars[m[1]] = m[2]

function color(v: string | undefined): RGB | null {
  if (!v || v === 'none') return null
  const hex = v.startsWith('var(') ? vars[v.slice(4, -1)] : v
  if (hex === '#fff' || hex === 'white') return [255, 255, 255]
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
}

function quad(a: Pt, c: Pt, b: Pt, n = 16): Pt[] {
  const out: Pt[] = []
  for (let i = 1; i <= n; i++) {
    const t = i / n
    out.push([
      (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
      (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
    ])
  }
  return out
}

/** SVG elliptical arc (no rotation) from p to q, endpoint parameterisation (SVG spec F.6.5). */
function arc(p: Pt, q: Pt, rx: number, ry: number, large: number, sweep: number, n = 24): Pt[] {
  const x1 = (p[0] - q[0]) / 2
  const y1 = (p[1] - q[1]) / 2
  const num = Math.max(0, rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1)
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1 || 1
  const s = (large === sweep ? -1 : 1) * Math.sqrt(num / den)
  const cx = s * ((rx * y1) / ry) + (p[0] + q[0]) / 2
  const cy = s * (-(ry * x1) / rx) + (p[1] + q[1]) / 2
  const a1 = Math.atan2((p[1] - cy) / ry, (p[0] - cx) / rx)
  let da = Math.atan2((q[1] - cy) / ry, (q[0] - cx) / rx) - a1
  if (sweep && da < 0) da += 2 * Math.PI
  if (!sweep && da > 0) da -= 2 * Math.PI
  const out: Pt[] = []
  for (let i = 1; i <= n; i++) {
    const a = a1 + (da * i) / n
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)])
  }
  return out
}

function parsePath(d: string): { pts: Pt[]; closed: boolean } {
  const tok = d.match(/[MLHVQAZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
  const pts: Pt[] = []
  let cur: Pt = [0, 0]
  let closed = false
  let i = 0
  const num = () => parseFloat(tok[i++])
  while (i < tok.length) {
    const c = tok[i++]
    if (c === 'M' || c === 'L') {
      cur = [num(), num()]
      pts.push(cur)
    } else if (c === 'H') {
      cur = [num(), cur[1]]
      pts.push(cur)
    } else if (c === 'V') {
      cur = [cur[0], num()]
      pts.push(cur)
    } else if (c === 'Q') {
      const ctrl: Pt = [num(), num()]
      const end: Pt = [num(), num()]
      pts.push(...quad(cur, ctrl, end))
      cur = end
    } else if (c === 'A') {
      const rx = num()
      const ry = num()
      num() // rotation (unused)
      const large = num()
      const sweep = num()
      const end: Pt = [num(), num()]
      pts.push(...arc(cur, end, rx, ry, large, sweep))
      cur = end
    } else if (c === 'Z') closed = true
  }
  return { pts, closed }
}

/** Walks the SVG markup with inherited attributes and collects shapes in paint order. */
function shapesFrom(svg: string): Shape[] {
  const shapes: Shape[] = []
  const stack: Record<string, string>[] = [{}]
  for (const m of svg.matchAll(/<(\/?)(\w+)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, attrText, selfClose] = m
    if (closing) {
      if (tag === 'g') stack.pop()
      continue
    }
    const own: Record<string, string> = {}
    for (const a of attrText.matchAll(/([\w-]+)="([^"]*)"/g)) own[a[1]] = a[2]
    const at = { ...stack[stack.length - 1], ...own }
    if (tag === 'g' && !selfClose) {
      // Group opacity multiplies down.
      const parentOpacity = parseFloat(stack[stack.length - 1].__opacity ?? '1')
      stack.push({ ...at, __opacity: String(parentOpacity * parseFloat(own.opacity ?? '1')) })
      continue
    }
    const alpha = parseFloat(at.__opacity ?? '1') * parseFloat(own.opacity ?? '1')
    const stroke = color(at.stroke)
    const fill = color(at.fill)
    const width = parseFloat(at['stroke-width'] ?? '1')
    if (tag === 'line' && stroke) {
      shapes.push({
        kind: 'stroke',
        pts: [
          [+own.x1, +own.y1],
          [+own.x2, +own.y2],
        ],
        width,
        color: stroke,
        alpha,
      })
    } else if (tag === 'circle') {
      const c: Pt = [+own.cx, +own.cy]
      if (fill) shapes.push({ kind: 'fill', circle: { c, r: +own.r }, color: fill, alpha })
      if (stroke) {
        const pts: Pt[] = []
        for (let k = 0; k <= 32; k++) {
          const a = (k / 32) * 2 * Math.PI
          pts.push([c[0] + +own.r * Math.cos(a), c[1] + +own.r * Math.sin(a)])
        }
        shapes.push({ kind: 'stroke', pts, width, color: stroke, alpha })
      }
    } else if (tag === 'rect' && fill) {
      shapes.push({
        kind: 'fill',
        rect: { x: +own.x, y: +own.y, w: +own.width, h: +own.height },
        color: fill,
        alpha,
      })
    } else if (tag === 'path' && own.d) {
      const { pts, closed } = parsePath(own.d)
      if (closed && fill) shapes.push({ kind: 'fill', poly: pts, color: fill, alpha })
      if (stroke && pts.length > 1)
        shapes.push({
          kind: 'stroke',
          pts: closed ? [...pts, pts[0]] : pts,
          width,
          color: stroke,
          alpha,
        })
    }
  }
  return shapes
}

function segDist(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / l))
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy))
}

function inPoly(px: number, py: number, poly: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function coverage(s: Shape, x: number, y: number): number {
  const aa = (d: number) => Math.max(0, Math.min(1, 0.5 - d * SCALE))
  if (s.kind === 'stroke') {
    let d = Infinity
    for (let i = 0; i < s.pts.length - 1; i++)
      d = Math.min(d, segDist(x, y, s.pts[i], s.pts[i + 1]))
    return aa(d - s.width / 2)
  }
  if (s.circle) return aa(Math.hypot(x - s.circle.c[0], y - s.circle.c[1]) - s.circle.r)
  if (s.rect) {
    const { x: rx, y: ry, w, h } = s.rect
    return x >= rx && x <= rx + w && y >= ry && y <= ry + h ? 1 : 0
  }
  return s.poly && inPoly(x, y, s.poly) ? 1 : 0
}

function paintTile(shapes: Shape[], raw: Buffer, rowBytes: number, ox: number, oy: number) {
  for (let y = 0; y < TH; y++)
    for (let x = 0; x < TW; x++) {
      const fx = (x + 0.5) / SCALE
      const fy = (y + 0.5) / SCALE
      let c: number[] = [255, 255, 255]
      for (const s of shapes) {
        const a = coverage(s, fx, fy) * s.alpha
        if (a > 0) c = c.map((v, i) => v + (s.color[i] - v) * a)
      }
      const o = (oy + y) * rowBytes + 1 + (ox + x) * 3
      raw[o] = Math.round(c[0])
      raw[o + 1] = Math.round(c[1])
      raw[o + 2] = Math.round(c[2])
    }
}

function crc32(buf: Buffer): number {
  let c = ~0
  for (const byte of buf) {
    c ^= byte
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
  }
  return ~c >>> 0
}

function png(w: number, h: number, raw: Buffer): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(td))
    return Buffer.concat([len, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// STYLE=doodle renders the doodle style to <id>-doodle.png (007).
const STYLE: FigureStyle = process.env.STYLE === 'doodle' ? 'doodle' : 'classic'

function svgOf(spec: FigureSpec, still: number): string {
  const html = renderToStaticMarkup(<Figure spec={spec} still={still} figureStyle={STYLE} />)
  return html.match(/<svg viewBox="0 0 250 180"[\s\S]*?<\/svg>/)![0]
}

it('renders figures', () => {
  const only = process.env.FIGURES?.split(',').filter(Boolean)
  mkdirSync(OUT, { recursive: true })
  for (const e of allExercises) {
    if (only && !only.includes(e.id)) continue
    const figures = [
      ...new Set([e.easier, e.standard, e.harder].filter(Boolean).map((v) => v!.figure)),
    ]
    const cols = Math.max(...figures.map((f) => f.keyframes.length))
    const W = cols * TW + (cols - 1) * GAP
    const H = figures.length * TH + (figures.length - 1) * GAP
    const rowBytes = W * 3 + 1
    const raw = Buffer.alloc(H * rowBytes, 200)
    for (let y = 0; y < H; y++) raw[y * rowBytes] = 0
    figures.forEach((f, r) =>
      f.keyframes.forEach((_, k) =>
        paintTile(shapesFrom(svgOf(f, k)), raw, rowBytes, k * (TW + GAP), r * (TH + GAP)),
      ),
    )
    const file = `${OUT}/${e.id}${STYLE === 'doodle' ? '-doodle' : ''}.png`
    writeFileSync(file, png(W, H, raw))
    console.log(file)
  }
}, 300_000)
