import fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';
import type { Config } from './typings/Config';

const filePath = '.config.json';

type Awaited<T> = T extends Promise<infer K> ? K : T;

let cachedConfig: Config;

export const getConfig = async (): Promise<Config> => {
    if(!cachedConfig) {
        const configContents = await fsp.readFile(filePath, 'utf-8');
        const config = JSON.parse(configContents) as unknown;
        const errors: string[] = [];
        const baseName = path.basename(filePath).split('.')[0];
        cachedConfig = await parse(config, baseName, errors) as Config;
        console.log(JSON.stringify(cachedConfig, null, 2))
        if (errors.length) {
            throw new Error(`some errors ocurred while trying to parse the config file at ${filePath}:\n\t${errors.join('\n\t')}`);
        }
    }
    return cachedConfig;
}

// Does not resolve any references to external values.
export const getConfigSync = (): Config => {
    if(!cachedConfig) {
        const configContents = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(configContents) as Config;
    }
    return cachedConfig;
}

const parse = async (configValue: unknown, path: string, errors: string[]): Promise<unknown> => {
    if (typeof configValue === 'string') {
        if (!configValue.startsWith('::')) {
            return configValue;
        }
        const split = configValue.split(' ');
        const directive = split[0];
        switch (directive.substring(2)) {
            case 'env': {
                if(split.length !== 2) {
                    errors.push(`at ${path}: env parameter has invalid number of arguments`);
                    return configValue;
                }
                const name = split[1];
                const value = process.env[name];
                if(value === undefined) {
                    errors.push(`at ${path}: missing required environment variable '${name}'`);
                    return configValue;
                }
                return value;
            }
            default:
                errors.push(`at ${path}: directive '${directive}' is not supported`);
                return configValue;
        }
    } else if (configValue instanceof Array) {
        return await Promise.all(configValue.map((v, i) => parse(v, `${path}[${i}]`, errors)));
    } else if (typeof configValue === 'object' && configValue !== null) {
        return Object.assign({}, ...await Promise.all(Object.keys(configValue).map(async k => ({ [k]: await parse((configValue as Record<string, unknown>)[k], `${path}.${k}`, errors) }))));
    } else {
        return configValue;
    }
}

const jsonParseOrSelf = (str: string): unknown => {
    try {
        return JSON.parse(str);
    } catch(_) {
        return str;
    }
}
