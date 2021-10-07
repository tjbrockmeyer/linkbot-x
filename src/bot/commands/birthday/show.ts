import { CommandSpec } from "../../../types/CommandSpec";

export const showBirthday: CommandSpec = {
    name: 'show birthday',
    description: 'show all registered birthdays',
    trainingSet: [
        'show birthdays',
        'known birthdays',
        'everyones birthdays'
    ],
    run: async (client, message, text) => {
        
    }
}
