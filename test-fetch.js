async function run() {
  try {
    await fetch("http://localhost:9999/does-not-exist");
  } catch (e) {
    console.log(e.name, e.message);
  }
}
run();
