const fs = require('fs');
const path = require('path');

const files = [
  'src/components/GradeRVisualBoard.tsx',
  'src/components/GradeR1Workbook.tsx',
  'src/components/CodingGridActivity.tsx',
  'src/components/Dashboard.tsx',
  'src/components/CreativeWorkstationApp.tsx',
  'src/app/api/check-workstation/route.ts',
  'src/app/api/grade-drawing/route.ts'
];

// Mapping from old ID to an intermediate token to prevent double replacements
const map1 = {
  'R-T1-W9': 'TEMP_ID_1',
  'R-T1-W1': 'TEMP_ID_2',
  'R-T1-W2': 'TEMP_ID_3',
  'R-T1-W3': 'TEMP_ID_4',
  'R-T1-W4': 'TEMP_ID_5',
  'R-T1-W5': 'TEMP_ID_6',
  'R-T1-W6': 'TEMP_ID_7',
  'R-T1-W7': 'TEMP_ID_8',
  'R-T1-W8': 'TEMP_ID_9'
};

const map2 = {
  'TEMP_ID_1': 'R-T1-W1',
  'TEMP_ID_2': 'R-T1-W2',
  'TEMP_ID_3': 'R-T1-W3',
  'TEMP_ID_4': 'R-T1-W4',
  'TEMP_ID_5': 'R-T1-W5',
  'TEMP_ID_6': 'R-T1-W6',
  'TEMP_ID_7': 'R-T1-W7',
  'TEMP_ID_8': 'R-T1-W8',
  'TEMP_ID_9': 'R-T1-W9'
};

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // First pass
    for (const [oldId, tempId] of Object.entries(map1)) {
      const regex = new RegExp(oldId + '(?![0-9])', 'g');
      content = content.replace(regex, tempId);
    }
    
    // Second pass
    for (const [tempId, newId] of Object.entries(map2)) {
      const regex = new RegExp(tempId, 'g');
      content = content.replace(regex, newId);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
