const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Let's see what files are importing images
const output = execSync('grep -rn "import.*assets/images/" src/').toString();
console.log(output);
