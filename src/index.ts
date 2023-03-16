import bot from "./bot";
import { config } from "./config";
import ensureCollections from "./database/ensureCollections";
import { withSession } from "./database";
import { stringifyError } from "./utils/objects";

const main = async () => {
  const { discord: { token } } = config
  withSession(async (ctx) => await ensureCollections(ctx)).catch((error) =>
    console.error(stringifyError(error))
  );
  await bot(token);
};

if (require.main === module) {
  main().catch((error) => console.error(stringifyError(error)));
}
