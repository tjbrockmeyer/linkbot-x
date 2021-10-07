import { CommandSpec } from "../../../types/CommandSpec";

export const lookupLeagueOfLegends: CommandSpec = {
    name: 'lookup league of legends',
    description: 'register your birthday to receive notifications in the chat when that day comes around again',
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
