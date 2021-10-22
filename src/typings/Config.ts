import { AppConfig } from "aws-sdk"

export type ConfigContent = {
    parameters: {
        name: string,
        path: string,
        version: number
    }[],
    databaseArgs: string[]
}

export type Secrets = {
    awsAccessKeyId?: string,
    awsSecretAccessKey?: string,
}

export type ConfigParameters = {
    database: {
        protocol: string,
        url: string
    },
    databaseUser: {
        user: string,
        password: string
    },
    discordBot: {
        token: string
    }
}

export type Config = {
    content: ConfigContent,
    parameters: ConfigParameters,
    secrets: Secrets,
}

export interface AWSAppConfig extends AppConfig.Configuration {
    Content: ConfigContent;
}