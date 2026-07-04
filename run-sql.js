const postgres = require('postgres');
const fs = require('fs');

async function run() {
  const sqlString = fs.readFileSync('add-school-lesson-status.sql', 'utf8');
  // Need to get the direct db url. Usually it's in process.env.DATABASE_URL
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
  const sql = postgres(connectionString);
  try {
    await sql.unsafe(sqlString);
    console.log("Migration executed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}
run();
