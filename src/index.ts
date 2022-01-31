
import bot from './bot';
import {getConfig} from './config';
import ensureCollections from './database/ensureCollections';
import { withSession } from './database';

const main = async () => {
    const {secrets: {discordToken}} = await getConfig();
    withSession(async ctx => await ensureCollections(ctx)).catch(console.error);
    await bot(discordToken);
}

if(require.main === module) {
    main().catch(console.error);
}