import type {AWSAppConfig, Config, ConfigContent, ConfigParameters, Secrets} from '../typings/Config';
import aws from 'aws-sdk';
import {promises as fs} from 'fs';
import {v4 as uuid} from 'uuid';

const ssm = new aws.SSM();
const appConfig = new aws.AppConfig();

const clientId: string = uuid();
const cacheLifetime = 2 * 60 * 1000;

let expirationTime = 0;
let cachedSecrets: Secrets;
let cachedConfig: AWSAppConfig;
let cachedParameters: ConfigParameters;

const readSecrets = async (): Promise<Secrets> => {
    const {Credentials} = JSON.parse(await fs.readFile('/run/secrets/assume_role', 'utf-8')) as aws.STS.AssumeRoleResponse;
    const secrets = {
        awsAccessKeyId: Credentials ? Credentials?.AccessKeyId : cachedSecrets?.awsAccessKeyId,
        awsSecretAccessKey: Credentials ? Credentials?.SecretAccessKey : cachedSecrets?.awsSecretAccessKey,
    };
    process.env.AWS_ACCESS_KEY_ID = secrets.awsAccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secrets.awsSecretAccessKey;
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

const requestParameters = async (config: ConfigContent): Promise<ConfigParameters> => {
    if(process.env.NODE_ENV !== 'production') {
        const contents = await fs.readFile('.config.json', {encoding: 'utf-8'});
        return JSON.parse(contents).parameters;
    }
    const paths = config.parameters.map(p => p.path);
    const pathToName = new Map(config.parameters.map(p => [p.path, p.name]));
    const {Parameters} = await ssm.getParameters({Names: paths, WithDecryption: true}).promise();
    const nameToValue = new Map((Parameters || []).map(p => {
        try {
            return [pathToName.get(p.Name as string), JSON.parse(p.Value as string)]
        } catch {
            return [pathToName.get(p.Name as string), p.Value as string]
        }
    }));
    const output: Record<string, unknown> = {}
    config.parameters.forEach(p => output[p.name] = nameToValue.get(p.name));
    return output as unknown as ConfigParameters
}

export default async (): Promise<Config> => {
    const now = Number(new Date());
    if(now >= expirationTime) {
        expirationTime = now + cacheLifetime;
        cachedSecrets = await readSecrets();
        cachedConfig = await requestAppConfig();
        cachedParameters = await requestParameters(cachedConfig.Content as ConfigContent);
    }
    return {
        content: cachedConfig.Content as ConfigContent,
        parameters: cachedParameters,
        secrets: cachedSecrets,
    }
}