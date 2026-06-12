/**
 * Recolor two-tone THP logo inside a hexagonal fond.
 * - Dark fond → background hue (then transparent)
 * - Light hoodie → hoodie hue
 * - Rim: fond pixels on the outer hex edge (touching transparent outside) → hoodie
 *
 * Usage: node scripts/recolor-thp-logo.mjs [input.png] [out-a.png] [out-b.png]
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from '/tmp/png-tools/node_modules/pngjs/lib/png.js';

const GREEN = { r: 0x5a, g: 0x9f, b: 0x76 }; // --primary #5a9f76
const BEIGE = { r: 0xc4, g: 0x9a, b: 0x62 }; // --accent #c49a62
const BORDER_PASSES = 2;

const NEIGHBORS4 = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorsEqual(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

function getPixel(png, x, y) {
  const i = (png.width * y + x) << 2;
  return {
    r: png.data[i],
    g: png.data[i + 1],
    b: png.data[i + 2],
    a: png.data[i + 3],
  };
}

function setPixel(png, x, y, color) {
  const i = (png.width * y + x) << 2;
  png.data[i] = color.r;
  png.data[i + 1] = color.g;
  png.data[i + 2] = color.b;
  png.data[i + 3] = color.a ?? 255;
}

function isTransparent(png, x, y) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return true;
  return getPixel(png, x, y).a === 0;
}

function isBackground(png, x, y, backgroundColor) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return false;
  const c = getPixel(png, x, y);
  return c.a > 0 && colorsEqual(c, backgroundColor);
}

/**
 * Paint a rim along the outer hexagonal fond edge (pixels touching transparent
 * outside the logo), expanding inward through fond only — not around the hoodie.
 */
function addHexFondBorder(png, backgroundColor, hoodieColor) {
  const w = png.width;
  const h = png.height;
  const painted = new Uint8Array(w * h);
  const queue = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isBackground(png, x, y, backgroundColor)) continue;

      for (const [dx, dy] of NEIGHBORS4) {
        if (isTransparent(png, x + dx, y + dy)) {
          queue.push(y * w + x);
          break;
        }
      }
    }
  }

  for (let pass = 0; pass < BORDER_PASSES && queue.length > 0; pass++) {
    const nextQueue = [];

    for (const idx of queue) {
      if (painted[idx]) continue;
      painted[idx] = 1;

      const x = idx % w;
      const y = Math.floor(idx / w);
      setPixel(png, x, y, hoodieColor);

      for (const [dx, dy] of NEIGHBORS4) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (painted[ni]) continue;
        if (!isBackground(png, nx, ny, backgroundColor)) continue;
        nextQueue.push(ni);
      }
    }

    queue.length = 0;
    queue.push(...nextQueue);
  }
}

function makeBackgroundTransparent(png, backgroundColor) {
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const c = getPixel(png, x, y);
      if (c.a > 0 && colorsEqual(c, backgroundColor)) {
        setPixel(png, x, y, { ...backgroundColor, a: 0 });
      }
    }
  }
}

function recolor(inputPath, outputPath, backgroundColor, hoodieColor) {
  const data = fs.readFileSync(inputPath);
  const png = PNG.sync.read(data);

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const c = getPixel(png, x, y);
      if (c.a === 0) continue;

      const lum = luminance(c.r, c.g, c.b);
      const target = lum < 128 ? backgroundColor : hoodieColor;
      setPixel(png, x, y, target);
    }
  }

  addHexFondBorder(png, backgroundColor, hoodieColor);
  makeBackgroundTransparent(png, backgroundColor);

  fs.writeFileSync(outputPath, PNG.sync.write(png));
  console.log(`Wrote ${outputPath} (${png.width}x${png.height})`);
}

const input =
  process.argv[2] ??
  '/home/dim/.cursor/projects/home-dim-THP-for-Good/assets/c__Users_dimit_AppData_Roaming_Cursor_User_workspaceStorage_f41e28e3033c92969009141ae36800ed_images_THP_logo-02865b75-8129-4ad5-b5e4-3c0b3e233e52.png';
const outGreenBeige =
  process.argv[3] ?? path.join(process.cwd(), 'public/thp-logo-green-beige.png');
const outBeigeGreen =
  process.argv[4] ?? path.join(process.cwd(), 'public/thp-logo-beige-green.png');

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

recolor(input, outGreenBeige, GREEN, BEIGE);
recolor(input, outBeigeGreen, BEIGE, GREEN);
