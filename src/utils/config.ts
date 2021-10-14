import type {AWSAppConfig, Config, ConfigContent, ConfigParameters} from '../typings/Config';
import aws from 'aws-sdk';
import {promises as fs} from 'fs';
import {v4 as uuid} from 'uuid';

const ssm = new aws.SSM();
const appConfig = new aws.AppConfig();

const clientId: string = uuid();
const cacheLifetime = 2 * 60 * 1000;

let expirationTime = 0;
let cachedConfig: AWSAppConfig;
let cachedParameters: ConfigParameters;

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
        cachedConfig = await requestAppConfig();
        cachedParameters = await requestParameters(cachedConfig.Content as ConfigContent);
    }
    return {
        content: cachedConfig.Content as ConfigContent,
        parameters: cachedParameters,
    }
}