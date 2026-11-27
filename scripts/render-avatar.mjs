import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PUBLIC = path.resolve(__dirname, "../public/brandbite-avatar.png");

// CRC32 table for valid PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([lenBuf, combined, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function hex(h) {
  const v = Number.parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function sdRoundedBox(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdCircle(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function sdPolygon(px, py, poly) {
  let minD = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const d = sdSegment(px, py, ax, ay, bx, by);
    if (d < minD) minD = d;
  }
  return pointInPoly(px, py, poly) ? -minD : minD;
}

function blend(dst, src, alpha) {
  const a = clamp(alpha, 0, 1);
  if (a <= 0) return;
  dst[0] = dst[0] * (1 - a) + src[0] * a;
  dst[1] = dst[1] * (1 - a) + src[1] * a;
  dst[2] = dst[2] * (1 - a) + src[2] * a;
}

// Precompute smooth polygons in 512x512 coordinate space matching brandbite-avatar.svg
const topBunPoly = [];
for (let i = 0; i <= 48; i++) {
  const t = i / 48;
  const u = 1 - t;
  // Cubic Bezier (140,242) -> (140,152) -> (364,152) -> (364,242)
  const x = u * u * u * 140 + 3 * u * u * t * 140 + 3 * u * t * t * 364 + t * t * t * 364;
  const y = u * u * u * 242 + 3 * u * u * t * 152 + 3 * u * t * t * 152 + t * t * t * 242;
  topBunPoly.push([x, y]);
}

const bottomBunPoly = [[148, 338], [356, 338]];
for (let i = 0; i <= 24; i++) {
  const t = i / 24;
  const u = 1 - t;
  const x = u * u * u * 356 + 3 * u * u * t * 356 + 3 * u * t * t * 330 + t * t * t * 252;
  const y = u * u * u * 338 + 3 * u * u * t * 374 + 3 * u * t * t * 388 + t * t * t * 388;
  bottomBunPoly.push([x, y]);
}
for (let i = 1; i <= 24; i++) {
  const t = i / 24;
  const u = 1 - t;
  const x = u * u * u * 252 + 3 * u * u * t * 174 + 3 * u * t * t * 148 + t * t * t * 148;
  const y = u * u * u * 388 + 3 * u * u * t * 388 + 3 * u * t * t * 374 + t * t * t * 338;
  bottomBunPoly.push([x, y]);
}

const cheesePoly = [
  [154, 278],
  [350, 278],
  [278, 332],
  [232, 292],
];

const lettucePts = [];
const qSegs = [
  [[132, 262], [166, 242], [200, 262]],
  [[200, 262], [234, 282], [268, 262]],
  [[268, 262], [302, 242], [336, 262]],
  [[336, 262], [354, 273], [372, 262]],
];
for (const [p0, p1, p2] of qSegs) {
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const u = 1 - t;
    lettucePts.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
}

function sdLettuce(px, py) {
  let minD = Infinity;
  for (let i = 0; i < lettucePts.length - 1; i++) {
    const [ax, ay] = lettucePts[i];
    const [bx, by] = lettucePts[i + 1];
    const d = sdSegment(px, py, ax, ay, bx, by);
    if (d < minD) minD = d;
  }
  return minD - 12;
}

function sdRotatedEllipse(px, py, cx, cy, rx, ry, deg) {
  const rad = (-deg * Math.PI) / 180;
  const dx = px - cx, dy = py - cy;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return (Math.hypot(lx / rx, ly / ry) - 1) * Math.min(rx, ry);
}

const C_BG0 = hex("#181512");
const C_BG1 = hex("#29221d");
const C_BADGE0 = hex("#f97316");
const C_BADGE1 = hex("#b91c1c");
const C_CREAM = hex("#fef3c7");
const C_INK = hex("#181512");
const C_TOPBUN = hex("#fbbf24");
const C_SEED = hex("#fffbeb");
const C_LETTUCE = hex("#22c55e");
const C_PATTY = hex("#451a03");
const C_CHEESE = hex("#facc15");
const C_BOTBUN = hex("#f59e0b");

async function main() {
  const W = 1024;
  const H = 1024;
  const scale = 512 / W;
  const aa = scale * 0.85;
  const buf = Buffer.alloc(W * H * 4);

  for (let y = 0; y < H; y++) {
    const sy = (y + 0.5) * scale;
    for (let x = 0; x < W; x++) {
      const sx = (x + 0.5) * scale;
      const gt = clamp((sx + sy) / 1024, 0, 1);
      const col = [
        lerp(C_BG0[0], C_BG1[0], gt),
        lerp(C_BG0[1], C_BG1[1], gt),
        lerp(C_BG0[2], C_BG1[2], gt),
      ];

      // Chomp mask (subtract 3 bite circles)
      const dBite1 = sdCircle(sx, sy, 412, 110, 68);
      const dBite2 = sdCircle(sx, sy, 342, 76, 48);
      const dBite3 = sdCircle(sx, sy, 440, 180, 48);
      const dBiteUnion = Math.min(dBite1, dBite2, dBite3);
      const maskAlpha = clamp((dBiteUnion + aa) / (2 * aa), 0, 1);

      if (maskAlpha > 0) {
        const fg = [col[0], col[1], col[2]];
        const dBox = sdRoundedBox(sx, sy, 256, 256, 180, 180, 92);

        if (dBox < 8 + aa) {
          // Badge fill
          const bt = clamp(((sx - 76) + (sy - 76)) / 720, 0, 1);
          const badgeFill = [
            lerp(C_BADGE0[0], C_BADGE1[0], bt),
            lerp(C_BADGE0[1], C_BADGE1[1], bt),
            lerp(C_BADGE0[2], C_BADGE1[2], bt),
          ];
          blend(fg, badgeFill, clamp((aa - dBox) / (2 * aa), 0, 1));

          // Cream border on box + chomp bite rings (clipped closely to badge)
          const clipBadge = clamp((8 + aa - dBox) / (2 * aa), 0, 1);
          const dBoxStroke = Math.abs(dBox) - 8;
          blend(fg, C_CREAM, clamp((aa - dBoxStroke) / (2 * aa), 0, 1));

          const dRingStroke = Math.min(
            Math.abs(dBite1) - 8,
            Math.abs(dBite2) - 8,
            Math.abs(dBite3) - 8
          );
          blend(fg, C_CREAM, clipBadge * clamp((aa - dRingStroke) / (2 * aa), 0, 1));

          // Top Bun (fill + 14px stroke => half-stroke 7)
          const dTop = sdPolygon(sx, sy, topBunPoly);
          blend(fg, C_INK, clamp((aa - (dTop - 7)) / (2 * aa), 0, 1));
          blend(fg, C_TOPBUN, clamp((aa - (dTop + 7)) / (2 * aa), 0, 1));

          // Sesame seeds
          const dSeed = Math.min(
            sdRotatedEllipse(sx, sy, 212, 194, 15, 8, -18),
            sdRotatedEllipse(sx, sy, 264, 184, 15, 8, 10),
            sdRotatedEllipse(sx, sy, 308, 204, 14, 7.5, 22)
          );
          blend(fg, C_SEED, clamp((aa - dSeed) / (2 * aa), 0, 1));

          // Crisp Lettuce
          const dLet = sdLettuce(sx, sy);
          blend(fg, C_LETTUCE, clamp((aa - dLet) / (2 * aa), 0, 1));

          // Patty
          const dPatty = sdRoundedBox(sx, sy, 252, 302, 118, 24, 24);
          blend(fg, C_INK, clamp((aa - (dPatty - 7)) / (2 * aa), 0, 1));
          blend(fg, C_PATTY, clamp((aa - (dPatty + 7)) / (2 * aa), 0, 1));

          // Melted Cheese Drip
          const dCheese = sdPolygon(sx, sy, cheesePoly);
          blend(fg, C_INK, clamp((aa - (dCheese - 5)) / (2 * aa), 0, 1));
          blend(fg, C_CHEESE, clamp((aa - (dCheese + 5)) / (2 * aa), 0, 1));

          // Bottom Bun
          const dBot = sdPolygon(sx, sy, bottomBunPoly);
          blend(fg, C_INK, clamp((aa - (dBot - 7)) / (2 * aa), 0, 1));
          blend(fg, C_BOTBUN, clamp((aa - (dBot + 7)) / (2 * aa), 0, 1));
        }

        blend(col, fg, maskAlpha);
      }

      const idx = (y * W + x) * 4;
      buf[idx] = Math.round(col[0]);
      buf[idx + 1] = Math.round(col[1]);
      buf[idx + 2] = Math.round(col[2]);
      buf[idx + 3] = 255;
    }
  }

  const png = encodePng(W, H, buf);
  await fs.writeFile(OUT_PUBLIC, png);
  console.log(`✅ Rendered ${W}x${H} PNG (${png.length} bytes) -> ${OUT_PUBLIC}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
