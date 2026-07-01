import fetch from 'node-fetch';

async function test() {
  const res = await fetch("http://localhost:3000/api/check-workstation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activityId: "test",
      title: "Test",
      description: "Test",
      targetDescription: "Test",
      imageData: null,
      objects: [{type: 'draw'}]
    })
  });
  const data = await res.json();
  console.log(data);
}
test();
