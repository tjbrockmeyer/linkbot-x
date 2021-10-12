import { Client } from "discord.js";
import { today } from "./utils/dates";
import { postOccurringBirthdays } from "./bot/actions/birthdayActions";


export const startCheckBirthdaysProcess = (client: Client) => {
    const now = today();
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const func = () => postOccurringBirthdays(client).catch(console.error);
    func();
    setTimeout(() => {
        func();
        setInterval(func, 24 * 60 * 60 * 1000);
    }, Number(startOfTomorrow) - Number(now))
}