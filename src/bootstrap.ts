import nodeVault from 'node-vault';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const bootstrap = async () => {
    try {
        if(process.env.VAULT_ROLE_ID === undefined) {
            const token = fs.readFileSync(path.join(os.homedir(), '.vault-token'), 'utf-8');
            const vault = nodeVault({token, endpoint: process.env.VAULT_ADDR});
            const {data: {role_id}} = await vault.read('auth/approle/role/linkbot-prod/role-id');
            process.env.VAULT_ROLE_ID = role_id;
        }
        if(process.env.VAULT_WRAPPED_SECRET_ID === undefined) {
            const token = fs.readFileSync(path.join(os.homedir(), '.vault-token'), 'utf-8');
            const vault = nodeVault({token, endpoint: process.env.VAULT_ADDR});
            const {wrap_info: {token: wrapped_secret_id}} = await vault.write('auth/approle/role/linkbot-prod/secret-id', {}, {headers: {'X-Vault-Wrap-TTL': '30s'}});
            process.env.VAULT_WRAPPED_SECRET_ID = wrapped_secret_id;
        }
        const vault = nodeVault({token: process.env.VAULT_WRAPPED_SECRET_ID, endpoint: process.env.VAULT_ADDR});
        const {data: {secret_id}} = await vault.write('sys/wrapping/unwrap', {});
        process.env.VAULT_SECRET_ID = secret_id;
    } catch(error) {
        console.error(error);
        if(typeof error === 'object' && error !== null && 'response' in error) {
            console.error(JSON.stringify((error as {response: any}).response));
        }
    }
};
