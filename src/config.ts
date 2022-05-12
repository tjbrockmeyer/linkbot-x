import { promises as fs } from 'fs';
import aws from 'aws-sdk';
import path from 'path';
import type { Config } from './typings/Config';

const ssm = new aws.SSM();
const filePath = '.config.json';

let cachedConfig: Config;

export const getConfig = async (): Promise<Config> => {
    if(!cachedConfig) {
        const configContents = await fs.readFile(filePath, 'utf-8');
        const config = JSON.parse(configContents) as unknown;
        const errors: string[] = [];
        const baseName = path.basename(filePath).split('.')[0];
        cachedConfig = await parse(config, baseName, errors) as Config;
        if (errors.length) {
            throw new Error(`some errors ocurred while trying to parse the config file at ${filePath}:\n\t${errors.join('\n\t')}`);
        }
    }
    return cachedConfig;
}

const parse = async (x: unknown, path: string, errors: string[]): Promise<unknown> => {
    if (typeof x === 'string') {
        if (!x.startsWith('::')) {
            return x;
        }
        const split = x.split(' ');
        const directive = split[0];
        switch (directive.substring(2)) {
            case 'ssm': {
                const name = split[1];
                const { Parameter: param } = await ssm.getParameter({ Name: name, WithDecryption: true }).promise();
                if (!param || !param.Value) {
                    errors.push(`at ${path}: ssm parameter ${name} is missing or empty`);
                    return x;
                }
                const result = jsonParseOrSelf(param.Value);
                if(split.length > 2) {
                    if(typeof result !== 'object' || result === null) {
                        errors.push(`at ${path}: ssm parameter is not an object/array, but an argument was provided to index into an object/array`);
                        return x;
                    }
                    return (result as Record<string, unknown>)[split[2]];
                }
                return result;
            }
            default:
                errors.push(`at ${path}: directive '${directive}' is not supported`);
                return x;
        }
    } else if (x instanceof Array) {
        return await Promise.all(x.map((v, i) => parse(v, `${path}[${i}]`, errors)));
    } else if (typeof x === 'object' && x !== null) {
        return Object.assign({}, ...await Promise.all(Object.keys(x).map(async k => ({ [k]: await parse((x as Record<string, unknown>)[k], `${path}.${k}`, errors) }))));
    } else {
        return x;
    }
}

const jsonParseOrSelf = (str: string): unknown => {
    try {
        return JSON.parse(str);
    } catch(_) {
        return str;
    }
}
