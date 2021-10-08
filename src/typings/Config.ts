export type ConfigContent = {
    parameters: {
        name: string,
        path: string,
        version: number
    }[],
    databaseArgs: string[]
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
    parameters: ConfigParameters
}