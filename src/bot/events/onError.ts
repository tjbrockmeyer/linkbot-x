import { Client } from "discord.js";

export default async (client: Client, error: Error) => {
    console.error('a client error occurred:', error);
}