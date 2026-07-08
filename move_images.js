const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Move directory
if (!fs.existsSync('public/assets')) {
  fs.mkdirSync('public/assets', { recursive: true });
}
if (fs.existsSync('src/assets/images')) {
  execSync('mv src/assets/images public/assets/');
}

// 2. Rewrite files
const files = [
  'src/components/GradeR1Workbook.tsx',
  'src/components/Grade1Week2Workbook.tsx',
  'src/zolaImages.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace imports like:
    // import varName from '../assets/images/filename.ext';
    // with:
    // const varName = '/assets/images/filename.ext';
    
    content = content.replace(/import\s+(\w+)\s+from\s+['"](?:\.\.\/|\.\/)*assets\/images\/(.+?)['"];/g, 
      (match, varName, fileName) => {
        return `const ${varName} = '/assets/images/${fileName}';`;
      }
    );
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
