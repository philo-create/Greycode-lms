const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:Greycode%4002@db.kisuxdgqlsffztkqiomq.supabase.co:5432/postgres'
});

async function main() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables:", res.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
