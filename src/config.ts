import { Config } from "./typings/Config";

const env = (name: string, defaultValue?: string) => {
    const value = process.env[name] || defaultValue;
    if (value === undefined) {
        throw new Error(`missing required environment variable: ${name}`);
    }
    return value;
}

export const config: Config = {
    general: {
        ownerId: env('OWNER_ID'),
        commandPrefix: env('COMMAND_PREFIX', '!'),
        timezoneOffset: Number(env('TZ_OFFSET', '5')),
    },
    database: {
        args: [],
        protocol: 'mongodb',
        url: env('MONGODB_URL'),
        user: env('MONGODB_USER'),
        password: env('MONGODB_PASSWORD')
    },
    discord: {
        token: env('DISCORD_TOKEN')
    }
}