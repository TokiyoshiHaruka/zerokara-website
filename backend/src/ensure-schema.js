const { ensureSchema } = require("./schema");

ensureSchema()
  .then(() => {
    console.log("[ENSURE-SCHEMA] schema ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[ENSURE-SCHEMA] failed.", error);
    process.exit(1);
  });
