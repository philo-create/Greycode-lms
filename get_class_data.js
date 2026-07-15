const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
// Try to check the schema of students_classes
console.log('Testing schema...');
