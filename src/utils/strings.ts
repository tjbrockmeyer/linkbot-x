

export const joinWithAnd = (items: string[]) => {
    if(items.length === 0) {
        return '';
    }
    const and = items.length > 2 ? ', and ' : ' and ';
    return items.slice(1).reduce((acc, val, i) => acc + (i < items.length - 2 ? ', ' : and) + val, items[0]);
}

const birthdayOwnerRegex = /(?:([a-zA-Z ]+?)(?:'?s|'s?) )?(?:birthday|bday)(?: of ([a-zA-Z ]+))?/i;
const selfBirthdayOwnerRegex = /my (?:birthday|bday)/i;
const separatedNameRegex = /(?:[A-Z][a-zA-Z]* )*[A-Z][a-zA-Z]*$/;

export const findBirthdayOwnerInText = (text: string): string|null => {
    const selfMatch = selfBirthdayOwnerRegex.exec(text);
    if(selfMatch) {
        return 'self';
    }
    const match = birthdayOwnerRegex.exec(text);
    if(match === null || !match[1] && !match[2]) {
        return null;
    }
    const nameMatch = match[1] ? separatedNameRegex.exec(match[1]) : separatedNameRegex.exec(match[2]);
    return nameMatch === null ? null : nameMatch[0];
}

const renameRegex = /rename (.+?) to (.+)/i;

export const findRenameInText = (text: string): [string, string]|null => {
    return null;
}