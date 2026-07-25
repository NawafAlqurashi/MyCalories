// One-off script: renders simple app icon PNGs (no external image deps).
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // no filter
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// Draws a rounded-square background with three "macro bar" shapes, like a
// minimal nutrition/progress logo.
function renderIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = hexToRgb("#0f172a"); // slate-900
  const accent = hexToRgb("#22c55e"); // green-500
  const accent2 = hexToRgb("#f97316"); // orange-500
  const white = [245, 247, 250];
  const radius = size * 0.22;

  const setPixel = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = a;
  };

  const insideRoundedSquare = (x, y) => {
    const pad = size * 0.04;
    const left = pad,
      top = pad,
      right = size - pad,
      bottom = size - pad;
    const cx = Math.min(Math.max(x, left + radius), right - radius);
    const cy = Math.min(Math.max(y, top + radius), bottom - radius);
    if (x < left || x > right || y < top || y > bottom) return false;
    const dx = x - cx;
    const dy = y - cy;
    if (x >= left + radius && x <= right - radius) return true;
    if (y >= top + radius && y <= bottom - radius) return true;
    return dx * dx + dy * dy <= radius * radius;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (insideRoundedSquare(x, y)) setPixel(x, y, bg);
    }
  }

  // Three bars of increasing height, like a simple bar chart / progress mark.
  const bars = [
    { h: 0.32, color: white },
    { h: 0.52, color: accent2 },
    { h: 0.72, color: accent },
  ];
  const barWidth = size * 0.14;
  const gap = size * 0.08;
  const totalWidth = bars.length * barWidth + (bars.length - 1) * gap;
  const startX = (size - totalWidth) / 2;
  const baseY = size * 0.78;

  bars.forEach((bar, idx) => {
    const x0 = startX + idx * (barWidth + gap);
    const barHeight = size * bar.h;
    const y0 = baseY - barHeight;
    const rBar = barWidth * 0.28;
    for (let y = y0; y < baseY; y++) {
      for (let x = x0; x < x0 + barWidth; x++) {
        const xi = Math.round(x);
        const yi = Math.round(y);
        // rounded top corners only
        if (y < y0 + rBar) {
          const cx = x < x0 + rBar ? x0 + rBar : x > x0 + barWidth - rBar ? x0 + barWidth - rBar : x;
          const cy = y0 + rBar;
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy > rBar * rBar) continue;
        }
        setPixel(xi, yi, bar.color);
      }
    }
  });

  return encodePNG(size, size, rgba);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512, 180]) {
  const png = renderIcon(size);
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  fs.writeFileSync(path.join(outDir, name), png);
  console.log("wrote", name);
}
