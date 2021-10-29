import { AppConfig } from "aws-sdk"

export type ConfigContent = {
    databaseArgs: string[]
}

export type Secrets = {
    dbProtocol: string,
    dbUrl: string,
    dbUser: string,
    dbPassword: string,
    discordToken: string,
}

export type Config = {
    content: ConfigContent,
    secrets: Secrets,
}

export interface AWSAppConfig extends AppConfig.Configuration {
    Content: ConfigContent;
}