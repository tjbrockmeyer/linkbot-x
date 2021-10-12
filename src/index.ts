
import bot from './bot';
import { startCheckBirthdaysProcess } from './backgroundProcesses';
import config from './utils/config';

const main = async () => {
    const {parameters: {discordBot: {token}}} = await config();
    const client = await bot(token);
    startCheckBirthdaysProcess(client);
}

if(require.main === module) {
    main().catch(console.error);
}