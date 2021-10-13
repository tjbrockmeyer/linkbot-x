import { DbContext } from "../typings/DbContext";
import { ensureBirthdayIndexes } from "./collections/birthdays";
import { ensureMessageErrorIndexes } from "./collections/messageErrors";
import { ensurePostedBirthdayIndexes } from "./collections/postedBirthdays";


export default async (ctx: DbContext) => {
    return await Promise.all([
        ensureBirthdayIndexes(ctx),
        ensurePostedBirthdayIndexes(ctx),
        ensureMessageErrorIndexes(ctx)
    ]);
}