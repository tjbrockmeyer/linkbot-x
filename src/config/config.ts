import { v4 as uuid } from 'uuid';
import aws, { AppConfig } from 'aws-sdk';
import { GeneralConfig } from '../typings/Config';

const appConfig = new aws.AppConfig();
const clientId: string = uuid();

let cachedConfig: AppConfig.Types.Configuration;
let cachedContent: GeneralConfig;

export const readAwsAppConfig = async (appName: string, env: string, configName: string = 'config'): Promise<GeneralConfig> => {
    const data = await appConfig.getConfiguration({
        Application: appName,
        Environment: env,
        Configuration: configName,
        ClientId: clientId,
        ClientConfigurationVersion: cachedConfig?.ConfigurationVersion
    }).promise();
    if(data.ConfigurationVersion !== cachedConfig?.ConfigurationVersion) {
        cachedConfig = data;
        cachedContent = JSON.parse(data.Content?.toString('utf-8') as string);
    }
    return cachedContent;
}