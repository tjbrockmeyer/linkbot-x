import type {Config} from '../typings/Config';
import {promises as fs} from 'fs';
import { readParameterStoreSecrets } from './secrets';
import { readAwsAppConfig } from './config';
import { startAwsAssumeRoleLoop } from './creds';


const cacheLifetime = 2 * 60 * 1000;

let expirationTime = 0;
let cachedConfig: Config;

export const getConfig = async (): Promise<Config> => {
    const roleArn = process.env.ROLE_ARN;
    if(!roleArn) {
        throw new Error('the environment variable ROLE_ARN is required for logging into AWS');
    }
    startAwsAssumeRoleLoop(roleArn, 'linkbot-session');
    const now = Number(new Date());
    if(now >= expirationTime) {
        if(process.env.NODE_ENV !== 'production') {
            cachedConfig = JSON.parse(await fs.readFile('.config.json', 'utf-8'));
        } else {
            const appName = process.env.APP_NAME;
            const env = process.env.ENV;
            if(!appName || !env) {
                throw new Error('the environment variables APP_NAME and ENV are required for working with AWS AppConfig');
            }
            cachedConfig = {
                general: await readAwsAppConfig(appName, env),
                secrets: await readParameterStoreSecrets(),
            };
        }
        expirationTime = now + cacheLifetime;
    }
    return cachedConfig;
}