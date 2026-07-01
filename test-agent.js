import fetch from 'node-fetch';

async function test() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "User-Agent": "aistudio-build"
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Hi" }] }]
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
