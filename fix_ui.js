const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the fallback logic to also update the UI optimistically
const oldBlock = `          if (response.ok) {
            alert('Email confirmed and password reset successfully!');
            await fetchUsers(); // Refresh the list
          } else {`;
const newBlock = `          if (response.ok) {
            alert('Email confirmed and password reset successfully!');
            // Optimistically update the UI
            setUsers(current => current.map(u => 
              u.id === userId ? { ...u, email_confirmed: true } : u
            ));
            await fetchUsers(); // Refresh the list
          } else {`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync(file, code);
