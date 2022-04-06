import { ColorResolvable, EmbedFieldData, Message, TextBasedChannels } from "discord.js";
import emoji from "../data/emoji";


const defaultFooter = 'Link Bot';
const defaultColor = 'DARK_GREEN';


export interface MessageOpts {
    text: string;
    color?: ColorResolvable;
    title?: string;
    footerText?: string;
    fields?: EmbedFieldData[];
}

export const sendMessage = async (channel: TextBasedChannels, opts: string|MessageOpts) => {
    const options = typeof opts === 'string' ? {text: opts} : opts;
    await channel.send({
        embeds: [{
            title: options.title,
            description: options.text,
            color: options.color || defaultColor,
            footer: {
                text: options.footerText || defaultFooter,
            },
            fields: options.fields,
        }]
    });
}

export const sendSuccess = async (message: Message) => {
    await message.react(emoji.whiteCheckMark);
}

export interface PaginatedMessageOpts {
    pages: {
        title: string;
        content: string;
    }[];
    color?: ColorResolvable;
    title?: string;
    footerText?: string;
}

export const sendPagination = async (channel: TextBasedChannels, opts: PaginatedMessageOpts) => {
    const message = await channel.send(paginatedMessage(opts, 0));
    let nextPage = await handlePaginatedReactions(message, opts, 0);
    while(nextPage !== null) {
        await message.edit(paginatedMessage(opts, nextPage));
        nextPage = await handlePaginatedReactions(message, opts, nextPage);
    }
}

const paginatedMessage = (opts: PaginatedMessageOpts, page: number) => ({
    embeds: [{
        title: opts.title,
        color: opts.color,
        footer: {
            text: opts.footerText || defaultFooter,
        },
        fields: [
            {
                name: opts.pages[page].title,
                value: opts.pages[page].content,
                inline: true,
            },
            {
                name: '*___Page___*',
                value: `${page + 1} of ${opts.pages.length}`,
                inline: true,
            },
        ],
    }],
});

const handlePaginatedReactions = async (message: Message, opts: PaginatedMessageOpts, page: number) => {
    await message.reactions.removeAll();
    const reactions = [
        ...(page === 0 ? [] : [
            emoji.previousTrack,
            emoji.arrowBackward,
        ]),
        ...(page === opts.pages.length - 1 ? [] : [
            emoji.arrowForward,
            emoji.nextTrack,
        ])
    ];
    for(const r of reactions) {
        await message.react(r);
    }
    const addedReactions = await message.awaitReactions({
        filter: x => reactions.includes(x.emoji.name as string),
        time: 60,
    });
    const e = addedReactions.first();
    if(e === undefined) {
        return null;
    }
    switch(e.emoji.name as string) {
        case emoji.previousTrack:
            return 0;
        case emoji.arrowBackward:
            return page - 1;
        case emoji.arrowForward:
            return page + 1;
        case emoji.nextTrack:
            return opts.pages.length - 1;
        default:
            return null;
    }
}