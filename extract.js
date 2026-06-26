const fs = require('fs');
const { PNG } = require('pngjs');

const svg = fs.readFileSync('src/components/greycode_board_top.svg', 'utf8');
const rx = /<image.*?xlink:href="data:image\/png;base64,([^"]+)"/s;
const match = rx.exec(svg);

if (match) {
  const buf = Buffer.from(match[1], 'base64');
  const png = PNG.sync.read(buf);
  console.log(`Image is ${png.width} x ${png.height}`);
  
  // scan a row in the middle
  const cy = Math.floor(png.height / 2);
  let leftEdge = -1, rightEdge = -1;
  for (let x = 0; x < png.width; x++) {
     const a = png.data[(cy * png.width + x) * 4 + 3];
     if (a > 50) {
         if (leftEdge === -1) leftEdge = x;
         rightEdge = x;
     }
  }
  
  console.log(`Board is from x=${leftEdge} to x=${rightEdge}`);
  
  // Find pins by looking for high red/green (gold/yellow text or holes) along the left and right edges
  // The pins are laid out vertically. Let's scan down a specific column
  const leftCol = leftEdge + 30; // guess 30 pixels in?
  // Let's actually scan the left edge for gold
  let firstY = -1;
  let lastY = -1;
  let pinYs = [];
  
  const searchColX = leftEdge + 45; // adjust this if needed
  let inPin = false;
  let currentPinStart = 0;
  
  for (let y = 0; y < png.height; y++) {
      let isGold = false;
      // check a small window
      for (let x = leftEdge; x < leftEdge + 100; x++) {
          const idx = (y * png.width + x) * 4;
          const r = png.data[idx];
          const g = png.data[idx+1];
          const b = png.data[idx+2];
          const a = png.data[idx+3];
          if (a > 200 && r > 150 && g > 150 && b < 100) {
              isGold = true;
              break;
          }
      }
      
      if (isGold) {
          if (!inPin) {
             inPin = true;
             currentPinStart = y;
          }
      } else {
          if (inPin) {
             inPin = false;
             pinYs.push(Math.floor((currentPinStart + y) / 2));
          }
      }
  }
  console.log(`Found ${pinYs.length} left pins.`);
  console.log('Ys: ', pinYs);
}
