import fs from 'fs';
if (fs.existsSync('.env')) {
  console.log(".env exists. Does it contain GEMINI_API_KEY?", fs.readFileSync('.env', 'utf-8').includes('GEMINI_API_KEY'));
} else {
  console.log(".env does not exist");
}
