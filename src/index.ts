
import bot from './bot';
import { startCheckBirthdaysProcess } from './backgroundProcesses';
import {getConfig} from './config';
import ensureCollections from './database/ensureCollections';
import { withSession } from './database';

const main = async () => {
    const {secrets: {discordToken}} = await getConfig();
    withSession(async ctx => await ensureCollections(ctx)).catch(console.error);
    const client = await bot(discordToken);
    startCheckBirthdaysProcess(client);
}

if(require.main === module) {
    main().catch(console.error);
}