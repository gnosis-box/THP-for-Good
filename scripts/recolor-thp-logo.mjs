/**
 * Recolor two-tone THP logo: dark pixels → colorA, light pixels → colorB.
 * Usage: node scripts/recolor-thp-logo.mjs <input.png> <out-a.png> <out-b.png>
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from '/tmp/png-tools/node_modules/pngjs/lib/png.js';

const GREEN = { r: 0x5a, g: 0x9f, b: 0x76 }; // --primary #5a9f76
const BEIGE = { r: 0xc4, g: 0x9a, b: 0x62 }; // --accent #c49a62

function parseHex(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorsEqual(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

function recolor(inputPath, outputPath, darkColor, lightColor, transparentColor) {
  const data = fs.readFileSync(inputPath);
  const png = PNG.sync.read(data);

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2;
      const r = png.data[i];
      const g = png.data[i + 1];
      const b = png.data[i + 2];
      const a = png.data[i + 3];

      if (a === 0) continue;

      const lum = luminance(r, g, b);
      const target = lum < 128 ? darkColor : lightColor;

      if (transparentColor && colorsEqual(target, transparentColor)) {
        png.data[i + 3] = 0;
        continue;
      }

      png.data[i] = target.r;
      png.data[i + 1] = target.g;
      png.data[i + 2] = target.b;
      png.data[i + 3] = 255;
    }
  }

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

// Version A: dark → green (transparent), light → beige
recolor(input, outGreenBeige, GREEN, BEIGE, GREEN);
// Version B: inverted — dark → beige (transparent), light → green
recolor(input, outBeigeGreen, BEIGE, GREEN, BEIGE);
