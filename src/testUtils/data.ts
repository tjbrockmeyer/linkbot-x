import { Config } from "../typings/Config";

export const fakeConfig: Config = {
    general: {
        databaseArgs: [],
        ownerId: 'abc123',
        commandPrefix: '!'
    },
    secrets: {
        dbProtocol: 'protocol',
        dbUrl: 'url',
        dbUser: 'user',
        dbPassword: 'password',
        discordToken: 'token',
    }
}