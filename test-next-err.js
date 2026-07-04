const { execSync } = require('child_process');
try {
  execSync('npm run build');
} catch (e) {
  console.log('Build failed.');
}
