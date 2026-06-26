const fs = require('fs');
const { PNG } = require('pngjs');

const svg = fs.readFileSync('src/components/greycode_board_top.svg', 'utf8');
const rx = /<image.*?xlink:href="data:image\/png;base64,([^"]+)"/s;
const match = rx.exec(svg);

if (match) {
  const buf = Buffer.from(match[1], 'base64');
  const png = PNG.sync.read(buf);
  
  const rightEdge = 735;
  let out = "";
  for (let y = 0; y < png.height; y += 40) {
      let row = y.toString().padStart(4, '0') + " ";
      for (let x = rightEdge - 40; x < rightEdge; x += 2) {
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
  fs.writeFileSync('right_edge_all.txt', out);
}
