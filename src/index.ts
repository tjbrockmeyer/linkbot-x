
import bot from './bot';
import config from './utils/config';

const main = async () => {
    const {parameters: {discordBot: {token}}} = await config();
    const client = await bot(token);
}

if(require.main === module) {
    main().catch(console.error);
}