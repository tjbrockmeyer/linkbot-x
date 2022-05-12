import bot from './bot';
import {getConfig} from './config';
import ensureCollections from './database/ensureCollections';
import { withSession } from './database';

const main = async () => {
    const {discord: {token}} = await getConfig();
    withSession(async ctx => await ensureCollections(ctx)).catch(console.error);
    await bot(token);
}

if(require.main === module) {
    main().catch(console.error);
}