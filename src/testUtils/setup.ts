import sinonChai from "sinon-chai";
import chai from 'chai';
import { restore } from "sinon";

chai.use(sinonChai);

afterEach(() => {
    restore();
});

process.env = {
    ...process.env,
    OWNER_ID: 'abc123',
    MONGODB_URL: 'database',
    MONGODB_USER: 'linkbot',
    MONGODB_PASSWORD: 'abc123',
    DISCORD_TOKEN: 'abc123',
}
