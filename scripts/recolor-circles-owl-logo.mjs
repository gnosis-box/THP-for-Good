/**
 * Recolor Circles owl logo (blue ink on orange→purple gradient) to beige on transparent.
 * Matches the hoodie hue from thp-logo-green-beige.png (#B98746).
 *
 * Background pixels are detected by comparing each row to the vertical gradient
 * sampled from the left/right image edges (outside the circular logo).
 *
 * Usage: node scripts/recolor-circles-owl-logo.mjs [input] [output.png]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('/tmp/png-tools/node_modules/sharp');
const { PNG } = require('/tmp/png-tools/node_modules/pngjs/lib/png.js');

const GOLD_OCHRE = { r: 0xb9, g: 0x87, b: 0x46 }; // green-beige hoodie #B98746
const GRADIENT_DISTANCE_THRESHOLD = 45;
const EDGE_COLUMNS = 3;

const input =
  process.argv[2] ??
  '/home/dim/.cursor/projects/home-dim-THP-for-Good/assets/c__Users_dimit_AppData_Roaming_Cursor_User_workspaceStorage_f41e28e3033c92969009141ae36800ed_images_ih2bo9v1JcT5j0Q9eDKMq6DQeg-a537c2a5-881e-4693-b596-beff35baf8e4.png';
const output =
  process.argv[3] ?? path.join(process.cwd(), 'public/circles-owl-logo-beige.png');

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function sampleVerticalGradient(data, width, height) {
  const gradient = [];
  const edgeX = [];
  for (let x = 0; x < EDGE_COLUMNS; x++) edgeX.push(x, width - 1 - x);

  for (let y = 0; y < height; y++) {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    for (const x of edgeX) {
      const i = (y * width + x) * 4;
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }
    const n = edgeX.length;
    gradient[y] = { r: rSum / n, g: gSum / n, b: bSum / n };
  }

  return gradient;
}

async function recolorOwlLogo(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    process.exit(1);
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const gradient = sampleVerticalGradient(data, width, height);
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const pixel = { r: data[i], g: data[i + 1], b: data[i + 2] };
      const dist = colorDistance(pixel, gradient[y]);

      if (dist <= GRADIENT_DISTANCE_THRESHOLD) {
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 0;
      } else {
        png.data[i] = GOLD_OCHRE.r;
        png.data[i + 1] = GOLD_OCHRE.g;
        png.data[i + 2] = GOLD_OCHRE.b;
        png.data[i + 3] = 255;
      }
    }
  }

  fs.writeFileSync(outputPath, PNG.sync.write(png));
  console.log(`Wrote ${outputPath} (${width}x${height})`);
}

await recolorOwlLogo(input, output);
