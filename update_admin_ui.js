const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldBlock = `          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.profiles)) {
              profiles = data.profiles;
              loadedFromApi = true;
              console.log('Successfully loaded and synchronized users from server API');
            }`;

const newBlock = `          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.profiles)) {
              profiles = data.profiles;
              loadedFromApi = true;
              console.log('Successfully loaded and synchronized users from server API', data.debug);
              if (data.debug && data.debug.mode === 'user') {
                setApiError('Warning: Supabase Service Role Key is missing or invalid in environment variables. Email confirmation status may be inaccurate.');
              }
            }`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync(file, code);
