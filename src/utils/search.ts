import { Guild, GuildMember } from "discord.js";
import { JaroWinklerDistance, NGrams } from "natural";
import { SearchResult } from "../typings/SearchResult";


export const fuzzySearch = <T>(
        searchTerm: string, searchFields: Array<string>, items: Array<T>, minimumMatchPercentage: number = 0.90): SearchResult<T>[] => {

    const results = searchFields.map((searchField, i) => ({
        value: JaroWinklerDistance(searchTerm, searchField),
        result: items[i]
    }));
    return results.filter(x => x.value > minimumMatchPercentage).sort((a, b) => a.value > b.value ? -1 : 1);
}

// export const searchGuildMembers = async (guild: Guild, searchTerm: string, minimumMatchPercentage: number = 0.90): Promise<GuildMember[]|null> => {
//     const members = (await guild.members.fetch()).map(m => m);
//     const searchTermsList = [
//         members.map(m => m.displayName),
//         members.map(m => m.user.username),
//         members.map(m => `${m.user.username}#${m.user.discriminator}`)
//     ];
//     for(const searchTerms of searchTermsList) {
//         const searchResults = fuzzySearch(searchTerm, searchTerms, members);
//         if(searchResults.length) {
//             return searchResults.map(r => r.result);
//         }
//     }
//     return [];
// }