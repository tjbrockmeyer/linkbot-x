import { Secrets } from "../typings/Config";
import { promises as fs } from 'fs';

import aws from 'aws-sdk';
const ssm = new aws.SSM();


export const readDockerSecrets = async (): Promise<Secrets> => {
    const secretFiles = ['role_creds', 'database_user', 'database', 'discord_creds'];
    const [roleCreds, dbUser, database, discordCreds] = await Promise.all(
        secretFiles.map(async file => JSON.parse(await fs.readFile(`/run/secrets/${file}`, 'utf-8'))));
    const secrets: Secrets = {
        dbUser: dbUser.user,
        dbPassword: dbUser.password,
        dbProtocol: database.protocol,
        dbUrl: database.url,
        discordToken: discordCreds.token,
    };
    process.env.AWS_ACCESS_KEY_ID = roleCreds?.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = roleCreds?.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = roleCreds?.SessionToken;
    return secrets;
}

export const readParameterStoreSecrets = async (): Promise<Secrets> => {
    const paths = [
        '/mongodb/database/linkbot/prod',
        '/mongodb/user/tyler',
        '/discord/bot/link-bot'
    ];
    const {Parameters, InvalidParameters} = await ssm.getParameters({Names: paths, WithDecryption: true}).promise();
    if(InvalidParameters && InvalidParameters.length) {
        throw new Error(`unable to get the following parameters: ${InvalidParameters.join(', ')}`);
    }
    const [database, dbUser, discordCreds] = paths.map(p => JSON.parse(Parameters?.find(x => x.Name === p)?.Value as string));
    const secrets: Secrets = {
        dbUser: dbUser.user,
        dbPassword: dbUser.password,
        dbProtocol: database.protocol,
        dbUrl: database.url,
        discordToken: discordCreds.token,
    };
    return secrets;
};
