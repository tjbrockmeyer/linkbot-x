import nodeVault from 'node-vault';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const bootstrap = async () => {
    if(process.env.VAULT_ROLE_ID !== undefined && process.env.VAULT_SECRET_ID !== undefined) {
        return;
    }
    const token = fs.readFileSync(path.join(os.homedir(), '.vault-token'), 'utf-8');
    if(!token) {
        throw new Error('no available token - please log in or pass the role_id and secret_id');
    }
    const vault = nodeVault({token, endpoint: process.env.VAULT_ADDR});
    const {data: {role_id}} = await vault.read('auth/approle/role/linkbot-prod/role-id');
    const {data: {secret_id}} = await vault.write('auth/approle/role/linkbot-prod/secret-id', undefined, {force: true});
    process.env.VAULT_ROLE_ID = role_id;
    process.env.VAULT_SECRET_ID = secret_id;
    
};
