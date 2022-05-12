export type Config = {
    general: {
        commandPrefix: string;
        ownerId: string;
    };
    database: {
        protocol: string;
        url: string;
        user: string;
        password: string;
        args: string[];
    };
    discord: {
        token: string;
    };
};
