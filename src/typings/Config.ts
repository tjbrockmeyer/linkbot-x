export type GeneralConfig = {
    commandPrefix: string,
    ownerId: string,
    databaseArgs?: string[],
}

export type Secrets = {
    dbProtocol: string,
    dbUrl: string,
    dbUser: string,
    dbPassword: string,
    discordToken: string,
}

export type Config = {
    general: GeneralConfig,
    secrets: Secrets,
}
