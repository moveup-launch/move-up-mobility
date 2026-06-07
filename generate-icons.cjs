// Script one-shot : génère public/icon-192.png et public/icon-512.png
const zlib = require('zlib');
const fs = require('fs');

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(d.length, 0);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(Buffer.concat([t, d])), 0);
  return Buffer.concat([len, t, d, crc]);
}

// Bitmaps 5×7 pour M et U
const M = [
  [1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],
  [1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],
];
const U = [
  [1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],
  [1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],
];

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 3, 10); // fond sombre #0A0A0A

  const set = (x, y, r, g, b) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 3;
    px[i] = r; px[i + 1] = g; px[i + 2] = b;
  };

  // Coins arrondis : rendre les coins en blanc (sera transparent via fond page)
  const radius = Math.round(size * 0.18);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let outside = false;
      if (x < radius && y < radius) {
        const dx = radius - x - 1, dy = radius - y - 1;
        if (dx * dx + dy * dy > radius * radius) outside = true;
      } else if (x >= size - radius && y < radius) {
        const dx = x - (size - radius), dy = radius - y - 1;
        if (dx * dx + dy * dy > radius * radius) outside = true;
      } else if (x < radius && y >= size - radius) {
        const dx = radius - x - 1, dy = y - (size - radius);
        if (dx * dx + dy * dy > radius * radius) outside = true;
      } else if (x >= size - radius && y >= size - radius) {
        const dx = x - (size - radius), dy = y - (size - radius);
        if (dx * dx + dy * dy > radius * radius) outside = true;
      }
      if (outside) set(x, y, 255, 255, 255);
    }
  }

  // Lettres MU en blanc, centrées
  const scale = Math.max(2, Math.floor(size / 40));
  const letterW = 5 * scale;
  const letterH = 7 * scale;
  const gap = Math.round(scale * 2.5);
  const totalW = letterW * 2 + gap;
  const ox = Math.round((size - totalW) / 2);
  const oy = Math.round((size - letterH) / 2);

  const drawLetter = (font, lx) => {
    for (let fy = 0; fy < 7; fy++) {
      for (let fx = 0; fx < 5; fx++) {
        if (!font[fy][fx]) continue;
        for (let sy = 0; sy < scale; sy++)
          for (let sx = 0; sx < scale; sx++)
            set(ox + lx + fx * scale + sx, oy + fy * scale + sy, 255, 255, 255);
      }
    }
  };
  drawLetter(M, 0);
  drawLetter(U, letterW + gap);

  // Construire le PNG
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

  const rowLen = 1 + size * 3;
  const raw = Buffer.allocUnsafe(size * rowLen);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 3;
      const ri = y * rowLen + 1 + x * 3;
      raw[ri] = px[pi]; raw[ri+1] = px[pi+1]; raw[ri+2] = px[pi+2];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync('public/icon-192.png', makeIcon(192));
fs.writeFileSync('public/icon-512.png', makeIcon(512));
console.log('Icônes créées : public/icon-192.png, public/icon-512.png');
