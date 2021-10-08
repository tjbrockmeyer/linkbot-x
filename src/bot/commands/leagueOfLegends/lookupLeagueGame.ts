import { CommandSpec } from "../../../typings/CommandSpec";

export const lookupLeagueOfLegends: CommandSpec = {
    name: 'lookup league game',
    description: 'lookup and paste a link to the league of legends game in the chat',
    trainingSet: [
        'lookup league of legends game',
        'show league game',
        'look up league game',
        'pull up our league game',
        'open our league of legends game'
    ],
    run: async (client, message, text) => {
        
    }
}
