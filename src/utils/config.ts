import type {AWSAppConfig, Config, ConfigContent, Secrets} from '../typings/Config';
import aws from 'aws-sdk';
import {promises as fs} from 'fs';
import {v4 as uuid} from 'uuid';

const appConfig = new aws.AppConfig();

const clientId: string = uuid();
const cacheLifetime = 2 * 60 * 1000;

let expirationTime = 0;
let cachedSecrets: Secrets;
let cachedConfig: AWSAppConfig;

const readSecrets = async (): Promise<Secrets> => {
    if(process.env.NODE_ENV !== 'production') {
        return JSON.parse(await fs.readFile('./config.json', 'utf-8'))
    }
    const secretFiles = ['role_creds', 'database_user', 'database', 'discord_creds'];
    const [roleCreds, dbUser, database, discordCreds] = await Promise.all(
        secretFiles.map(async file => JSON.parse(await fs.readFile(`/run/secrets/${file}`, 'utf-8'))));
    const secrets: Secrets = {
        dbUser: dbUser.user,
        dbPassword: dbUser.password,
        dbProtocol: database.protocol,
        dbUrl: database.url,
        discordToken: discordCreds.token,
    };
    process.env.AWS_ACCESS_KEY_ID = roleCreds?.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = roleCreds?.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = roleCreds?.SessionToken;
    return secrets;
}

const requestAppConfig = async (): Promise<AWSAppConfig> => {
    if(process.env.NODE_ENV !== 'production') {
        const contents = await fs.readFile('.config.json', {encoding: 'utf-8'});
        return {
            Content: JSON.parse(contents).content,
            ConfigurationVersion: '1',
            ContentType: 'application/json'
        };
    }
    if(!process.env.APP_NAME || !process.env.ENV) {
        throw new Error('APP_NAME and ENV environment variables are required');
    }
    const data = await appConfig.getConfiguration({
        Application: process.env.APP_NAME,
        Environment: process.env.ENV,
        Configuration: 'config',
        ClientId: clientId,
        ClientConfigurationVersion: cachedConfig?.ConfigurationVersion
    }).promise();
    if(data.ConfigurationVersion !== cachedConfig?.ConfigurationVersion) {
        return {
            Content: data.Content ? JSON.parse(data.Content.toString('utf-8')) : undefined,
            ConfigurationVersion: data.ConfigurationVersion,
            ContentType: data.ContentType
        };
    }
    return cachedConfig;
}

export default async (): Promise<Config> => {
    const now = Number(new Date());
    if(now >= expirationTime) {
        expirationTime = now + cacheLifetime;
        cachedSecrets = await readSecrets();
        cachedConfig = await requestAppConfig();
    }
    return {
        content: cachedConfig.Content as ConfigContent,
        secrets: cachedSecrets,
    }
}