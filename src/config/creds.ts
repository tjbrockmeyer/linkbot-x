import aws from 'aws-sdk';

const sts = new aws.STS();

const originalAwsId = process.env.AWS_ACCESS_KEY_ID;
const originalAwsSecret = process.env.AWS_SECRET_ACCESS_KEY;
let awsCredsLoopStarted = false;

export const startAwsAssumeRoleLoop = (roleArn: string, sessionName: string): void => {
    if(awsCredsLoopStarted) {
        return;
    }
    awsCredsLoopStarted = true;
    awsAssumeRole(roleArn, sessionName)
        .catch(error => console.error(`unable to assume role as ${roleArn}:`, error))
        .then(expiration => setTimeout(() => startAwsAssumeRoleLoop(roleArn, sessionName), expiration ? Number(expiration) - Number(new Date()) - 60000 : 10000));
}

export const awsAssumeRole = async (roleArn: string, sessionName: string): Promise<Date> => {
    process.env.AWS_ACCESS_KEY_ID = originalAwsId;
    process.env.AWS_SECRET_ACCESS_KEY = originalAwsSecret;

    const response = await sts.assumeRole({RoleArn: roleArn, RoleSessionName: sessionName}).promise();
    if(!response.Credentials) {
        throw new Error('could not retrieve credentials');
    }

    process.env.AWS_ACCESS_KEY_ID = response.Credentials.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = response.Credentials.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = response.Credentials.SessionToken;
    return response.Credentials.Expiration;
}
