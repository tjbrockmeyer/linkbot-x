import { config } from "../config";

const msPerSecond = 1000;
const msPerMinute = 60 * msPerSecond;
const msPerHour = 60 * msPerMinute;
const msPerDay = 24 * msPerHour;

const isInvalidDate = (date: Date) => JSON.stringify(date) === 'null';
const dateRegex = /(?:0?[1-9]|1[0-2])(\/|-)(?:0?[0-9]|[1-2][0-9]|3[0-1])\1(?:[1-9][0-9]{3}|[0-9]{2})/;
const timezoneDifference = -config.general.timezoneOffset * msPerHour;

const todayMs = () => Date.now() + timezoneDifference;
export const today = () => new Date(todayMs());
export const tomorrow = () => new Date(todayMs() + msPerDay);
export const yesterday = () => new Date(todayMs() - msPerDay);

console.log(today(), '\n', tomorrow(), '\n', yesterday());

export const findDateInText = (text: string): Date|null => {
    const words = text.split(' ');
    const foundDateWord = words.find(x => !isInvalidDate(new Date(x)) && Number(new Date(x)) !== 0);
    const date = words.includes('today') ? today()
        : words.includes('tomorrow') ? tomorrow()
        : words.includes('yesterday') ? yesterday()
        : foundDateWord ? new Date(foundDateWord)
        : null;
    return !date ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}