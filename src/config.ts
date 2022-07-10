import fsp from 'fs/promises';
import fs from 'fs';
import aws from 'aws-sdk';
import nodeVault from 'node-vault';
import path from 'path';
import type { Config } from './typings/Config';
import EventEmitter from 'events';
import { bootstrap } from './bootstrap';

const ssm = new aws.SSM();
const filePath = '.config.json';

const newVaultKvGetter = async () => {
    const cache = {} as Record<string, Error | Record<string, string>>;
    const inProgress = new Set() as Set<string>;
    const event = new EventEmitter();
    const vault = nodeVault({
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR
    });
    await vault.approleLogin({
        role_id: process.env.VAULT_ROLE_ID,
        secret_id: process.env.VAULT_SECRET_ID,
    });
    return async (name: string, secret: string): Promise<string | undefined> => {
        if(cache[name] === undefined) {
            if(inProgress.has(name)) {
                await new Promise(resolve => event.on(name, resolve));
            } else {
                inProgress.add(name);
                try {
                    const result = await vault.read(name) as {data: {data: Record<string, string>}};
                    cache[name] = result.data.data;
                } catch(error) {
                    cache[name] = error instanceof Error ? error : new Error(JSON.stringify(error));
                }
                inProgress.delete(name);
                event.emit(name);
            }
        }
        const result = cache[name];
        if(result instanceof Error) {
            throw result;
        }
        return result[secret];
    }
}

type Awaited<T> = T extends Promise<infer K> ? K : T;

let vaultKvGet: Awaited<ReturnType<typeof newVaultKvGetter>>;
let cachedConfig: Config;

export const getConfig = async (): Promise<Config> => {
    await bootstrap();
    if(!cachedConfig) {
        const configContents = await fsp.readFile(filePath, 'utf-8');
        const config = JSON.parse(configContents) as unknown;
        const errors: string[] = [];
        const baseName = path.basename(filePath).split('.')[0];
        vaultKvGet = await newVaultKvGetter();
        cachedConfig = await parse(config, baseName, errors) as Config;
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
            case 'ssm': {
                const name = split[1];
                const { Parameter: param } = await ssm.getParameter({ Name: name, WithDecryption: true }).promise();
                if (!param || !param.Value) {
                    errors.push(`at ${path}: ssm parameter ${name} is missing or empty`);
                    return configValue;
                }
                const result = jsonParseOrSelf(param.Value);
                if(split.length > 2) {
                    if(typeof result !== 'object' || result === null) {
                        errors.push(`at ${path}: ssm parameter is not an object/array, but an argument was provided to index into an object/array`);
                        return configValue;
                    }
                    return (result as Record<string, unknown>)[split[2]];
                }
                return result;
            }
            case 'vault': {
                if(split.length !== 3) {
                    errors.push(`at ${path}: vault parameter has invalid number of arguments`);
                    return configValue;
                }
                const name = split[1];
                const secret = split[2];
                try {
                    const value = await vaultKvGet(name, secret);
                    if(value === undefined) {
                        errors.push(`at ${path}: ${name} exists, but ${secret} is not present as a secret`);
                        return configValue;
                    }
                    return value;
                } catch(error) {
                    errors.push(`at ${path}: unable to get key from vault - ${error}`);
                    return configValue;
                }
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
