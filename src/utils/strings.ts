

export const joinWithAnd = (items: string[]) => {
    if(items.length === 0) {
        return '';
    }
    const and = items.length > 2 ? ', and ' : ' and ';
    return items.slice(1).reduce((acc, val, i) => acc + (i < items.length - 2 ? ', ' : and) + val, items[0]);
}

const birthdayOwnerRegex = /(?:(\S+?)'?s )?(?:birthday|bday)(?: of (\S+))?/i;
const selfBirthdayOwnerRegex = /my (?:birthday|bday)/i;

export const findBirthdayOwnerInText = (text: string): string|null => {
    const selfMatch = selfBirthdayOwnerRegex.exec(text);
    if(selfMatch) {
        return 'self';
    }
    const match = birthdayOwnerRegex.exec(text);
    if(match === null || !match[1] && !match[2]) {
        return null;
    }
    return match[1] || match[2];
}