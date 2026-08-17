const { createApp } = require("./app");
const { ensureSchema } = require("./schema");

const PORT = process.env.PORT || 3000;

async function start() {
  const app = createApp();
  await ensureSchema();
  app.listen(PORT, () => {
    console.log(`ZERO API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("[ZERO API] failed to start", error);
  process.exit(1);
});
