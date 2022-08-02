import nodeVault from "node-vault";
import fs from "fs/promises";
import os from "os";
import path from "path";

const getWrappedToken = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vault = nodeVault({
      token: await fs.readFile(
        path.join(os.homedir(), ".vault-token"),
        "utf-8"
      ),
      endpoint: process.env.VAULT_ADDR,
    });
    const {
      wrap_info: { token: wrapped_secret_id },
    } = await vault.write(
      "auth/approle/role/linkbot-prod/secret-id",
      {},
      { headers: { "X-Vault-Wrap-TTL": "30s" } }
    );
    return wrapped_secret_id;
  } else {
    const file = "/tmp/vault-token";
    let i = 0;
    while (true) {
      try {
        return await fs.readFile(file, "utf-8");
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("no such file or directory")
        ) {
          i++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (i > 30) {
            console.error("timeout exceeded while waiting for the vault token");
            process.exit(1);
          }
        }
        console.error(error);
        process.exit(1);
      }
    }
  }
};

export const bootstrap = async () => {
  try {
    const vault = nodeVault({
      token: await getWrappedToken(),
      endpoint: process.env.VAULT_ADDR,
    });
    const {
      data: { secret_id },
    } = await vault.write("sys/wrapping/unwrap", {});
    process.env.VAULT_SECRET_ID = secret_id;
  } catch (error) {
    const msg =
      typeof error === "object" && error !== null && "response" in error
        ? JSON.stringify((error as { response: any }).response)
        : error;
    console.error(msg);
    process.exit(1);
  }
};
