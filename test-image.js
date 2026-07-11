const http = require('http');

http.get('http://localhost:3000/assets/images/regenerated_image_1783234133812.png', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', () => {});
  res.on('end', () => console.log('Done'));
});
