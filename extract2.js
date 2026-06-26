const fs = require('fs');
const { PNG } = require('pngjs');

const svg = fs.readFileSync('src/components/greycode_board_top.svg', 'utf8');
const rx = /<image.*?xlink:href="data:image\/png;base64,([^"]+)"/s;
const match = rx.exec(svg);

if (match) {
  const buf = Buffer.from(match[1], 'base64');
  const png = PNG.sync.read(buf);
  const leftEdge = 241;
  const rightEdge = 735;
  const boardWidth = rightEdge - leftEdge;
  
  // Pins are probably located near leftEdge + width * 0.05 and rightEdge - width * 0.05
  // Let's print out a 20x20 ASCII representation of the left edge and right edge for a few rows
  // to find the exact x and y of the first pin.
  // Actually, we can just look for the repeating pattern of pins!
  
  const colX = Math.floor(leftEdge + boardWidth * 0.05);
  
  // Let's compute average brightness of a small window across the left side 
  // and print an ascii map from y=0 to y=600 and x=leftEdge to leftEdge+50
  let out = "";
  for (let y = 150; y < 800; y += 4) {
      let row = y.toString().padStart(4, '0') + " ";
      for (let x = leftEdge; x < leftEdge + 40; x += 2) {
          const idx = (y * png.width + x) * 4;
          const r = png.data[idx];
          const g = png.data[idx+1];
          const b = png.data[idx+2];
          const brightness = (r + g + b) / 3;
          if (brightness > 200) row += "O";
          else if (brightness > 100) row += "+";
          else row += " ";
      }
      out += row + "\n";
  }
  fs.writeFileSync('left_edge.txt', out);
}
