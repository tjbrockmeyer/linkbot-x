import { Client } from "discord.js";

export default async (client: Client, message: string) => {
    console.warn('a client warning occurred:', message);
}