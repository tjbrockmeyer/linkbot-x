
import bot from './bot';
import { startCheckBirthdaysProcess } from './backgroundProcesses';
import config from './utils/config';
import ensureCollections from './database/ensureCollections';
import { withSession } from './database';

const main = async () => {
    const {parameters: {discordBot: {token}}} = await config();
    withSession(ctx => ensureCollections(ctx)).catch(console.error);
    const client = await bot(token);
    startCheckBirthdaysProcess(client);
}

if(require.main === module) {
    main().catch(console.error);
}