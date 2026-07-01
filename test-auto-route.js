import fetch from 'node-fetch';

async function test() {
  const res = await fetch("http://localhost:3000/api/auto-route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      components: [{ id: "1", componentType: "battery", x: 0, y: 0 }, { id: "2", componentType: "led", x: 10, y: 10 }],
      prompt: "Connect them"
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
