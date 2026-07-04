const url = 'https://kisuxdgqlsffztkqiomq.supabase.co';
const apikey = 'sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX';

async function main() {
  try {
    // 1. Sign in
    console.log("Signing in...");
    const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': apikey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'skillsprogram@greycode.co.za',
        password: 'Greycode@02'
      })
    });
    
    const authData = await authRes.json();
    if (!authRes.ok) {
      throw new Error(`Auth failed: ${JSON.stringify(authData)}`);
    }
    
    const token = authData.access_token;
    console.log("Signed in successfully! Token obtained.");
    
    // 2. Query modules table
    console.log("Querying modules table...");
    const res = await fetch(`${url}/rest/v1/modules`, {
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${token}`
      }
    });
    
    const modules = await res.json();
    console.log("Modules data:", JSON.stringify(modules, null, 2));
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
